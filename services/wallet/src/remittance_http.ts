/// HTTP adapter for the Member-facing Remittance surface (R4; contract:
/// packages/types/openapi/openapi.remittance.yaml; ruling: ADR-0013 / OD-2).
///
/// A driving adapter over the remittance state machine and `RemittanceStore`. It
/// adds NO policy: it resolves the Member (default-deny), initiates a remittance,
/// and reads state + audit history. It deliberately exposes ONLY what a Member may
/// do — send, and see whether it reached home. The rail-driven transitions
/// (`recipient_available`, `settled`) are NOT here: a Member cannot self-confirm,
/// just as they cannot set their own dignity floor. Those arrive through a rail
/// adapter over the same store.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import { initiateRemittance, type Remittance } from './remittance.js';
import type { RemittanceStore } from './remittance_ledger.js';

export interface RemittanceRouteDeps {
  readonly sessions: SessionStore;
  readonly store: RemittanceStore;
  /** Clock for server time + the SLA deadline. Injectable for tests. */
  readonly now?: () => Date;
  /** Remittance id factory. Injectable for deterministic tests. */
  readonly newId?: () => string;
}

interface MoneyDto {
  readonly minor: number;
  readonly currency: 'INR';
}

function remittanceView(r: Remittance): Record<string, unknown> {
  const view: Record<string, unknown> = {
    id: r.id,
    state: r.state,
    amount: { minor: r.amount.minor, currency: r.amount.currency },
    recipient_id: r.recipientId,
    initiated_at: r.initiatedAt,
    escalate_after: r.escalateAfter,
    family_acknowledged: r.familyAcknowledged,
    history: r.history.map((e) => ({ type: e.type, at: e.at })),
  };
  if (r.settlementId !== undefined) view.settlement_id = r.settlementId;
  return view;
}

function errorEnvelope(code: string, detail: string) {
  return { code, message: detail, correlation_id: randomUUID() };
}

function readPaise(value: unknown): number | null {
  if (typeof value !== 'object' || value === null) return null;
  const m = value as { minor?: unknown; currency?: unknown };
  if (m.currency !== 'INR') return null;
  if (typeof m.minor !== 'number' || !Number.isInteger(m.minor) || m.minor < 1) return null;
  return m.minor;
}

type ParsedInitiate =
  | { readonly ok: true; readonly recipientId: string; readonly minor: number; readonly settlementId?: string }
  | { readonly ok: false; readonly code: string; readonly detail: string };

function parseInitiate(body: unknown): ParsedInitiate {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'invalid_request', detail: 'Body must be a JSON object.' };
  }
  const b = body as { recipient_id?: unknown; amount?: unknown; settlement_id?: unknown };
  if (typeof b.recipient_id !== 'string' || b.recipient_id.length === 0) {
    return { ok: false, code: 'invalid_recipient', detail: "Field 'recipient_id' is required." };
  }
  const minor = readPaise(b.amount);
  if (minor === null) {
    return { ok: false, code: 'invalid_amount', detail: "Field 'amount' must be Money in positive integer paise." };
  }
  if (b.settlement_id !== undefined && typeof b.settlement_id !== 'string') {
    return { ok: false, code: 'invalid_settlement_id', detail: "Field 'settlement_id' must be a string." };
  }
  const parsed: ParsedInitiate = { ok: true, recipientId: b.recipient_id, minor };
  return b.settlement_id !== undefined ? { ...parsed, settlementId: b.settlement_id } : parsed;
}

export function registerRemittanceRoutes(app: FastifyInstance, deps: RemittanceRouteDeps): void {
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

  app.post(`${API_PREFIX}/remittances`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;

    const parsed = parseInitiate(request.body);
    if (!parsed.ok) {
      return reply.code(400).send(errorEnvelope(parsed.code, parsed.detail));
    }

    const remittance = initiateRemittance({
      id: newId(),
      membershipId: member,
      recipientId: parsed.recipientId,
      amount: { minor: parsed.minor, currency: 'INR' },
      now: now(),
      ...(parsed.settlementId !== undefined ? { settlementId: parsed.settlementId } : {}),
    });
    await deps.store.save(remittance);
    return reply.code(201).send(remittanceView(remittance));
  });

  app.get(`${API_PREFIX}/remittances`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const mine = await deps.store.listForMember(member);
    return reply.code(200).send({ remittances: mine.map(remittanceView) });
  });

  app.get(`${API_PREFIX}/remittances/:id`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const id = (request.params as { id: string }).id;
    const remittance = await deps.store.get(id);
    // Not found, or not the caller's own — the same 404, so ownership does not leak.
    if (!remittance || remittance.membershipId !== member) {
      return reply.code(404).send(errorEnvelope('not_found', 'No such remittance.'));
    }
    return reply.code(200).send(remittanceView(remittance));
  });
}
