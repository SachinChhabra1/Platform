/// HTTP adapter for service-authed OPS/scheduler triggers (infra; contract:
/// packages/types/openapi/openapi.ops.yaml).
///
/// Background work in Nia is driven by an EXTERNAL scheduler (cron/queue) calling
/// these endpoints — not an in-process timer — so the batch operations stay pure,
/// testable, and runnable anywhere. Every route is SERVICE-authed (the same
/// `X-Nia-Service-Token` as the rail), never a Member session. The endpoints add
/// no policy: they invoke the batch functions in the domain/ledger modules.
///
/// Currently hosts the remittance SLA sweep (R4). Savings accrual/settlement jobs
/// join this surface as they land.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX } from '@nia/runtime';
import { sweepRemittanceSla, type OperatorEscalations, type RemittanceStore } from './remittance_ledger.js';
import {
  accrueAllSavings,
  settleDueWithdrawals,
  type SavingsAccountStore,
  type WithdrawalStore,
} from './savings_ledger.js';
import type { InterestAccrualPolicy } from './savings.js';
import { SERVICE_TOKEN_HEADER, type ServiceAuthenticator } from './service_auth.js';

export interface OpsRouteDeps {
  readonly auth: ServiceAuthenticator;
  /** Remittance SLA sweep dependencies (R4). */
  readonly remittance: { readonly store: RemittanceStore; readonly operator: OperatorEscalations };
  /**
   * Savings-job dependencies (R7). Optional so the ops surface can be composed
   * incrementally — the savings routes are only registered when provided. `policy`
   * is the Founder-owned interest seam (zero default until wired).
   */
  readonly savings?: {
    readonly accounts: SavingsAccountStore;
    readonly withdrawals: WithdrawalStore;
    readonly policy: InterestAccrualPolicy;
  };
  readonly now?: () => Date;
}

function errorEnvelope(code: string, detail: string) {
  return { code, message: detail, correlation_id: randomUUID() };
}

export function registerOpsRoutes(app: FastifyInstance, deps: OpsRouteDeps): void {
  const now = deps.now ?? (() => new Date());

  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.hasHeader('X-Nia-Server-Time')) {
      reply.header('X-Nia-Server-Time', now().toISOString());
    }
    return payload;
  });

  app.setErrorHandler(async (_error, _request, reply: FastifyReply) => {
    return reply.code(500).send(errorEnvelope('internal_error', 'An unexpected error occurred.'));
  });

  function serviceOrDeny(request: FastifyRequest, reply: FastifyReply): boolean {
    const header = request.headers[SERVICE_TOKEN_HEADER];
    const token = Array.isArray(header) ? header[0] : header;
    if (!deps.auth.authenticate(token)) {
      void reply.code(401).send(errorEnvelope('unauthorized', 'Missing or invalid service token.'));
      return false;
    }
    return true;
  }

  // Escalate every unconfirmed remittance whose 24h SLA has breached (ADR-0013).
  // Idempotent — safe to call on any schedule.
  app.post(`${API_PREFIX}/ops/remittance-sla-sweep`, async (request, reply) => {
    if (!serviceOrDeny(request, reply)) return reply;
    const result = await sweepRemittanceSla(now(), deps.remittance);
    return reply.code(200).send({ scanned: result.scanned, escalated: [...result.escalated] });
  });

  // Savings jobs — registered only when the savings deps are wired (ADR-0016).
  const savings = deps.savings;
  if (savings) {
    // Accrue interest on every account up to now, via the Founder-owned policy.
    app.post(`${API_PREFIX}/ops/savings-accrual`, async (request, reply) => {
      if (!serviceOrDeny(request, reply)) return reply;
      const result = await accrueAllSavings(now(), { accounts: savings.accounts, policy: savings.policy });
      return reply.code(200).send({ scanned: result.scanned, accrued: result.accrued });
    });

    // Settle every `available` withdrawal past its T+n settlement time.
    app.post(`${API_PREFIX}/ops/savings-settle-withdrawals`, async (request, reply) => {
      if (!serviceOrDeny(request, reply)) return reply;
      const result = await settleDueWithdrawals(now(), { withdrawals: savings.withdrawals });
      return reply.code(200).send({ settled: [...result.settled] });
    });
  }
}
