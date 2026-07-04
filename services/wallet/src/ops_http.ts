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
import {
  resolveConflict,
  type ReconciliationItem,
  type ReconciliationQueue,
  type ResolutionChoice,
  type SyncStore,
} from './offline_sync.js';
import { SERVICE_TOKEN_HEADER, type ServiceAuthenticator } from './service_auth.js';
import { OPERATOR_TOKEN_HEADER, type OperatorAuthenticator } from './operator_auth.js';

export interface OpsRouteDeps {
  readonly auth: ServiceAuthenticator;
  /** Remittance SLA sweep dependencies (R4). */
  readonly remittance: { readonly store: RemittanceStore; readonly operator: OperatorEscalations };
  /**
   * The offline money-conflict reconciliation surface (R6). Optional; when wired,
   * the Operator surface is registered: read (list/view) plus RESOLVE (OD-8 /
   * ADR-0019). Resolution is an authoritative `store` write and is gated by the
   * per-operator credential (`operators`), distinct from the service token.
   */
  readonly reconciliation?: {
    readonly queue: ReconciliationQueue;
    readonly store: SyncStore;
    readonly operators: OperatorAuthenticator;
  };
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

  // The Operator reconciliation surface (R6). READS are service-authed; RESOLVE
  // (OD-8 / ADR-0019) is gated by the per-operator credential and writes the
  // authoritative record.
  const reconciliation = deps.reconciliation;
  if (reconciliation) {
    const { queue, store, operators } = reconciliation;

    function operatorOrDeny(request: FastifyRequest, reply: FastifyReply): string | undefined {
      const header = request.headers[OPERATOR_TOKEN_HEADER];
      const credential = Array.isArray(header) ? header[0] : header;
      const identity = operators.authenticate(credential);
      if (!identity) {
        void reply.code(401).send(errorEnvelope('unauthorized', 'Missing or invalid operator credential.'));
        return undefined;
      }
      return identity.operatorId;
    }

    app.get(`${API_PREFIX}/ops/reconciliation`, async (request, reply) => {
      if (!serviceOrDeny(request, reply)) return reply;
      const pending = await queue.listPending();
      return reply.code(200).send({ conflicts: pending.map(conflictView) });
    });

    app.get(`${API_PREFIX}/ops/reconciliation/:recordId`, async (request, reply) => {
      if (!serviceOrDeny(request, reply)) return reply;
      const recordId = (request.params as { recordId: string }).recordId;
      const items = await queue.listForRecord(recordId);
      return reply.code(200).send({ conflicts: items.map(conflictView) });
    });

    // Resolve a pending conflict (OD-8): accept-proposal / keep-server / manual.
    // Operator-authed; every resolution is an authoritative write recording who + why.
    app.post(`${API_PREFIX}/ops/reconciliation/:id/resolve`, async (request, reply) => {
      const operatorId = operatorOrDeny(request, reply);
      if (operatorId === undefined) return reply;
      const id = (request.params as { id: string }).id;
      const item = await queue.get(id);
      if (!item) return reply.code(404).send(errorEnvelope('not_found', 'No such conflict.'));
      if (item.status !== 'pending') {
        return reply.code(409).send(errorEnvelope('already_resolved', 'This conflict is already resolved.'));
      }
      const parsed = parseResolve(request.body);
      if (!parsed.ok) return reply.code(400).send(errorEnvelope(parsed.code, parsed.detail));

      const { persist, item: resolved } = resolveConflict(item, {
        choice: parsed.choice,
        operatorId,
        reason: parsed.reason,
        now: now(),
        ...(parsed.hasPayload ? { manualPayload: parsed.manualPayload } : {}),
      });
      if (persist !== undefined) await store.put(persist);
      await queue.save(resolved);
      return reply.code(200).send(conflictView(resolved));
    });
  }
}

const RESOLUTION_CHOICES: ReadonlySet<ResolutionChoice> = new Set<ResolutionChoice>([
  'accept_proposal',
  'keep_server',
  'manual',
]);

type ParsedResolve =
  | { readonly ok: true; readonly choice: ResolutionChoice; readonly reason: string; readonly hasPayload: boolean; readonly manualPayload?: unknown }
  | { readonly ok: false; readonly code: string; readonly detail: string };

function parseResolve(body: unknown): ParsedResolve {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'invalid_request', detail: 'Body must be a JSON object.' };
  }
  const b = body as { choice?: unknown; reason?: unknown; payload?: unknown };
  if (typeof b.choice !== 'string' || !RESOLUTION_CHOICES.has(b.choice as ResolutionChoice)) {
    return { ok: false, code: 'invalid_choice', detail: "Field 'choice' must be accept_proposal, keep_server, or manual." };
  }
  if (typeof b.reason !== 'string' || b.reason.trim().length === 0) {
    return { ok: false, code: 'invalid_reason', detail: "Field 'reason' is required (the audit note)." };
  }
  const choice = b.choice as ResolutionChoice;
  const hasPayload = 'payload' in b && b.payload !== undefined;
  if (choice === 'manual' && !hasPayload) {
    return { ok: false, code: 'invalid_payload', detail: "A 'manual' resolution requires a corrected 'payload'." };
  }
  return { ok: true, choice, reason: b.reason, hasPayload, ...(hasPayload ? { manualPayload: b.payload } : {}) };
}

function conflictView(item: ReconciliationItem): Record<string, unknown> {
  const view: Record<string, unknown> = {
    id: item.id,
    record_id: item.recordId,
    record_class: item.recordClass,
    proposed_updated_at: item.proposed.updatedAt,
    at: item.at,
    status: item.status,
  };
  if (item.serverUpdatedAt !== undefined) view.server_updated_at = item.serverUpdatedAt;
  if (item.resolution !== undefined) {
    view.resolution = {
      choice: item.resolution.choice,
      operator_id: item.resolution.operatorId,
      reason: item.resolution.reason,
      resolved_at: item.resolution.resolvedAt,
      persisted: item.resolution.persisted,
    };
  }
  return view;
}
