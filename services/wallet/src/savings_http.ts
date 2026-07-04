/// HTTP adapter for the Member-facing Savings surface (R7; contract:
/// packages/types/openapi/openapi.savings.yaml; ruling: ADR-0016 / OD-5).
///
/// A driving adapter over the savings domain + stores. It adds NO policy. It
/// exposes only what the MEMBER does: read their savings account (with interest
/// accrued to now) and request/read withdrawals. Withdrawn funds are immediately
/// available; rail settlement (available → settled) is rail-driven and is NOT on
/// this Member API (same principle as remittance confirmation and RafiQi taking
/// an action). Deposits arrive server-side via the wage waterfall (ADR-0012).
///
/// The interest RATE/formula is the injected `policy` seam and the settlement
/// horizon `n` is `settleAfterMs` config — both Founder-owned, never invented here.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import {
  accrueInterest,
  balancePaise,
  requestWithdrawal,
  type InterestAccrualPolicy,
  type SavingsAccount,
  type Withdrawal,
} from './savings.js';
import type { SavingsAccountStore, WithdrawalStore } from './savings_ledger.js';

export interface SavingsRouteDeps {
  readonly sessions: SessionStore;
  readonly accounts: SavingsAccountStore;
  readonly withdrawals: WithdrawalStore;
  /** The interest rate/formula/fee seam (Founder-owned pricing). */
  readonly policy: InterestAccrualPolicy;
  /** The disclosed settlement horizon `n`, in milliseconds (Founder-owned config). */
  readonly settleAfterMs: number;
  readonly now?: () => Date;
  readonly newId?: () => string;
}

function money(minor: number): Record<string, unknown> {
  return { minor, currency: 'INR' };
}

function accountView(a: SavingsAccount): Record<string, unknown> {
  return {
    id: a.id,
    principal: money(a.principalPaise),
    accrued_interest: money(a.netInterestPaise + a.feePaise),
    fee_charged: money(a.feePaise),
    net_interest: money(a.netInterestPaise),
    balance: money(balancePaise(a)),
    locked: a.locked,
    opened_at: a.openedAt,
    last_accrued_at: a.lastAccruedAt,
  };
}

function withdrawalView(w: Withdrawal): Record<string, unknown> {
  const view: Record<string, unknown> = {
    id: w.id,
    account_id: w.accountId,
    amount: money(w.amountPaise),
    state: w.state,
    requested_at: w.requestedAt,
    available_at: w.availableAt,
    settle_due_at: w.settleDueAt,
    history: w.history.map((e) => ({ type: e.type, at: e.at })),
  };
  if (w.settledAt !== undefined) view.settled_at = w.settledAt;
  return view;
}

function errorEnvelope(code: string, detail: string) {
  return { code, message: detail, correlation_id: randomUUID() };
}

type ParsedWithdrawal =
  | { readonly ok: true; readonly amountPaise: number }
  | { readonly ok: false; readonly code: string; readonly detail: string };

function parseWithdrawal(body: unknown): ParsedWithdrawal {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'invalid_request', detail: 'Body must be a JSON object.' };
  }
  const amount = (body as { amount?: unknown }).amount as { minor?: unknown; currency?: unknown } | null;
  if (
    typeof amount !== 'object' ||
    amount === null ||
    amount.currency !== 'INR' ||
    typeof amount.minor !== 'number' ||
    !Number.isInteger(amount.minor) ||
    amount.minor < 1
  ) {
    return { ok: false, code: 'invalid_amount', detail: "Field 'amount' must be Money in positive integer paise." };
  }
  return { ok: true, amountPaise: amount.minor };
}

export function registerSavingsRoutes(app: FastifyInstance, deps: SavingsRouteDeps): void {
  const now = deps.now ?? (() => new Date());
  const newId = deps.newId ?? (() => randomUUID());

  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.hasHeader('X-Nia-Server-Time')) {
      reply.header('X-Nia-Server-Time', now().toISOString());
    }
    return payload;
  });

  app.setErrorHandler(async (_error, _request, reply: FastifyReply) => {
    return reply.code(500).send(errorEnvelope('internal_error', 'An unexpected error occurred.'));
  });

  function memberOrDeny(request: FastifyRequest, reply: FastifyReply): string | undefined {
    const session = sessionFromRequest(request, deps.sessions);
    if (!session) {
      void reply.code(401).send(errorEnvelope('unauthorized', 'Missing or invalid session.'));
      return undefined;
    }
    if (session.scope !== 'member') {
      void reply.code(403).send(errorEnvelope('forbidden', 'This needs a full Member session.'));
      return undefined;
    }
    return session.membershipId;
  }

  app.get(`${API_PREFIX}/savings/account`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const account = await deps.accounts.getForMember(member);
    if (!account) {
      return reply.code(404).send(errorEnvelope('not_found', 'No savings account yet.'));
    }
    // Accrue-on-read so the balance the Member sees is current, without requiring a
    // running accrual job (the job is remaining infra; the seam yields zero until
    // the Founder supplies the rate).
    const accrued = accrueInterest(account, deps.policy, now());
    await deps.accounts.save(accrued);
    return reply.code(200).send(accountView(accrued));
  });

  app.post(`${API_PREFIX}/savings/withdrawals`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const parsed = parseWithdrawal(request.body);
    if (!parsed.ok) return reply.code(400).send(errorEnvelope(parsed.code, parsed.detail));

    const account = await deps.accounts.getForMember(member);
    if (!account) {
      return reply.code(404).send(errorEnvelope('not_found', 'No savings account yet.'));
    }
    const at = now();
    const accrued = accrueInterest(account, deps.policy, at);
    try {
      const { account: debited, withdrawal } = requestWithdrawal(accrued, {
        id: newId(),
        amountPaise: parsed.amountPaise,
        now: at,
        settleAfterMs: deps.settleAfterMs,
      });
      await deps.accounts.save(debited);
      await deps.withdrawals.save(withdrawal);
      return reply.code(201).send(withdrawalView(withdrawal));
    } catch {
      // Locked account or insufficient balance — a conflict with the account's
      // current state. No penalty is applied; the withdrawal is simply refused.
      return reply.code(409).send(errorEnvelope('withdrawal_refused', 'This amount cannot be withdrawn right now.'));
    }
  });

  app.get(`${API_PREFIX}/savings/withdrawals`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const mine = await deps.withdrawals.listForMember(member);
    return reply.code(200).send({ withdrawals: mine.map(withdrawalView) });
  });

  app.get(`${API_PREFIX}/savings/withdrawals/:id`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const id = (request.params as { id: string }).id;
    const withdrawal = await deps.withdrawals.get(id);
    if (!withdrawal || withdrawal.membershipId !== member) {
      return reply.code(404).send(errorEnvelope('not_found', 'No such withdrawal.'));
    }
    return reply.code(200).send(withdrawalView(withdrawal));
  });
}
