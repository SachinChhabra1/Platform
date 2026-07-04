/// HTTP adapter for the payment-rail webhook surface (R4 infra; contract:
/// packages/types/openapi/openapi.rail.yaml; ruling: ADR-0013 / OD-2).
///
/// The rail-DRIVEN transitions the Member API deliberately does NOT expose
/// (`sent`, `recipient_available`, `settled`) arrive here, over the same
/// `RemittanceStore`, authenticated by SERVICE auth (not a Member session — a
/// Member cannot self-confirm their own remittance, ADR-0013). It adds NO policy:
/// it maps a rail callback onto the state-machine transition in `remittance.ts`.
///
/// Webhooks are re-delivered, so every endpoint is IDEMPOTENT: a callback that
/// asks for a transition already applied returns 200 with the current state; a
/// genuinely invalid transition (e.g. settle before confirmation, or acting on an
/// escalated remittance the Operator now owns) returns 409.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX } from '@nia/runtime';
import {
  markRecipientAvailable,
  markSent,
  markSettled,
  type Remittance,
  type RemittanceState,
} from './remittance.js';
import type { RemittanceStore } from './remittance_ledger.js';
import { SERVICE_TOKEN_HEADER, type ServiceAuthenticator } from './service_auth.js';

export interface RemittanceRailRouteDeps {
  readonly store: RemittanceStore;
  /** Service auth for the rail (Founder/ops-owned secret, injected). */
  readonly auth: ServiceAuthenticator;
  readonly now?: () => Date;
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

/** A transition handler: the states in which it is ALREADY satisfied (idempotent
 *  no-op → 200), and the pure transition to apply otherwise (throwing → 409). */
interface RailTransition {
  readonly already: ReadonlySet<RemittanceState>;
  readonly apply: (r: Remittance, now: Date) => Remittance;
}

export function registerRemittanceRailRoutes(app: FastifyInstance, deps: RemittanceRailRouteDeps): void {
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

  async function handle(
    request: FastifyRequest,
    reply: FastifyReply,
    transition: RailTransition,
  ): Promise<FastifyReply> {
    if (!serviceOrDeny(request, reply)) return reply;
    const id = (request.params as { id: string }).id;
    const remittance = await deps.store.get(id);
    if (!remittance) {
      return reply.code(404).send(errorEnvelope('not_found', 'No such remittance.'));
    }
    // Idempotent re-delivery: the transition is already applied — echo current state.
    if (transition.already.has(remittance.state)) {
      return reply.code(200).send(remittanceView(remittance));
    }
    try {
      const next = transition.apply(remittance, now());
      await deps.store.save(next);
      return reply.code(200).send(remittanceView(next));
    } catch {
      // The state machine rejected the transition (e.g. settle before confirm, or
      // the remittance escalated and the Operator now owns it).
      return reply.code(409).send(errorEnvelope('invalid_transition', 'That rail update does not apply to this remittance.'));
    }
  }

  // "Sent" — money left on the rail. Already satisfied once it is in transit or
  // any later state (it was, by definition, sent).
  app.post(`${API_PREFIX}/rail/remittances/:id/sent`, (request, reply) =>
    handle(request, reply, {
      already: new Set<RemittanceState>(['in_transit', 'confirmed_available', 'settled']),
      apply: markSent,
    }),
  );

  // "Recipient available" — the ONLY confirmation ("Reached home").
  app.post(`${API_PREFIX}/rail/remittances/:id/recipient-available`, (request, reply) =>
    handle(request, reply, {
      already: new Set<RemittanceState>(['confirmed_available', 'settled']),
      apply: markRecipientAvailable,
    }),
  );

  // Final rail settlement — only after confirmation.
  app.post(`${API_PREFIX}/rail/remittances/:id/settled`, (request, reply) =>
    handle(request, reply, {
      already: new Set<RemittanceState>(['settled']),
      apply: markSettled,
    }),
  );
}
