/// HTTP adapter for the Member-facing RafiQi surface (R5; contract:
/// packages/types/openapi/openapi.rafiqi.yaml; ruling: ADR-0014 / OD-3).
///
/// A driving adapter over the RafiQi domain + stores. It adds NO policy. It
/// exposes only what the MEMBER decides: grant a standing authorisation, revoke
/// it, see their grants, see RafiQi's actions, and REVERSE an action within its
/// 24h window. RafiQi *taking* an action (auto/confirmed) is the orchestrator
/// boundary (ADR-0004) and is not on this Member API.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import {
  grantAuthorization,
  reverseAction,
  revokeGrant,
  type AuthorizationGrant,
  type RafiqiAction,
} from './rafiqi.js';
import type { GrantStore, RafiqiActionStore } from './rafiqi_ledger.js';

export interface RafiqiRouteDeps {
  readonly sessions: SessionStore;
  readonly grants: GrantStore;
  readonly actions: RafiqiActionStore;
  readonly now?: () => Date;
  readonly newId?: () => string;
}

function grantView(g: AuthorizationGrant): Record<string, unknown> {
  const view: Record<string, unknown> = {
    id: g.id,
    action_type: g.actionType,
    cap: { minor: g.capPaise, currency: 'INR' },
    granted_at: g.grantedAt,
    expires_at: g.expiresAt,
  };
  if (g.revokedAt !== undefined) view.revoked_at = g.revokedAt;
  return view;
}

function actionView(a: RafiqiAction): Record<string, unknown> {
  const view: Record<string, unknown> = {
    id: a.id,
    action_type: a.actionType,
    amount: { minor: a.amountPaise, currency: 'INR' },
    taken_at: a.takenAt,
    reversible_until: a.reversibleUntil,
    authorization: a.authorization,
    state: a.state,
    history: a.history.map((e) => ({ type: e.type, at: e.at })),
  };
  if (a.grantId !== undefined) view.grant_id = a.grantId;
  return view;
}

function errorEnvelope(code: string, detail: string) {
  return { code, message: detail, correlation_id: randomUUID() };
}

type ParsedGrant =
  | { readonly ok: true; readonly actionType: string; readonly capPaise: number; readonly ttlMs: number }
  | { readonly ok: false; readonly code: string; readonly detail: string };

function parseGrant(body: unknown): ParsedGrant {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'invalid_request', detail: 'Body must be a JSON object.' };
  }
  const b = body as { action_type?: unknown; cap?: unknown; ttl_ms?: unknown };
  if (typeof b.action_type !== 'string' || b.action_type.length === 0) {
    return { ok: false, code: 'invalid_action_type', detail: "Field 'action_type' is required." };
  }
  const cap = b.cap as { minor?: unknown; currency?: unknown } | null;
  if (typeof cap !== 'object' || cap === null || cap.currency !== 'INR' || typeof cap.minor !== 'number' || !Number.isInteger(cap.minor) || cap.minor < 1) {
    return { ok: false, code: 'invalid_cap', detail: "Field 'cap' must be Money in positive integer paise." };
  }
  if (typeof b.ttl_ms !== 'number' || !Number.isInteger(b.ttl_ms) || b.ttl_ms < 1) {
    return { ok: false, code: 'invalid_ttl', detail: "Field 'ttl_ms' must be a positive integer." };
  }
  return { ok: true, actionType: b.action_type, capPaise: cap.minor, ttlMs: b.ttl_ms };
}

export function registerRafiqiRoutes(app: FastifyInstance, deps: RafiqiRouteDeps): void {
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

  app.post(`${API_PREFIX}/rafiqi/grants`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const parsed = parseGrant(request.body);
    if (!parsed.ok) return reply.code(400).send(errorEnvelope(parsed.code, parsed.detail));

    const grant = grantAuthorization({
      id: newId(),
      membershipId: member,
      actionType: parsed.actionType,
      capPaise: parsed.capPaise,
      now: now(),
      ttlMs: parsed.ttlMs,
    });
    await deps.grants.save(grant);
    return reply.code(201).send(grantView(grant));
  });

  app.get(`${API_PREFIX}/rafiqi/grants`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const mine = await deps.grants.listForMember(member);
    return reply.code(200).send({ grants: mine.map(grantView) });
  });

  app.post(`${API_PREFIX}/rafiqi/grants/:id/revoke`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const id = (request.params as { id: string }).id;
    const grant = await deps.grants.get(id);
    if (!grant || grant.membershipId !== member) {
      return reply.code(404).send(errorEnvelope('not_found', 'No such grant.'));
    }
    const revoked = revokeGrant(grant, now());
    await deps.grants.save(revoked);
    return reply.code(200).send(grantView(revoked));
  });

  app.get(`${API_PREFIX}/rafiqi/actions`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const mine = await deps.actions.listForMember(member);
    return reply.code(200).send({ actions: mine.map(actionView) });
  });

  app.get(`${API_PREFIX}/rafiqi/actions/:id`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const id = (request.params as { id: string }).id;
    const action = await deps.actions.get(id);
    if (!action || action.membershipId !== member) {
      return reply.code(404).send(errorEnvelope('not_found', 'No such action.'));
    }
    return reply.code(200).send(actionView(action));
  });

  app.post(`${API_PREFIX}/rafiqi/actions/:id/reverse`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const id = (request.params as { id: string }).id;
    const action = await deps.actions.get(id);
    if (!action || action.membershipId !== member) {
      return reply.code(404).send(errorEnvelope('not_found', 'No such action.'));
    }
    try {
      const reversed = reverseAction(action, now());
      await deps.actions.save(reversed);
      return reply.code(200).send(actionView(reversed));
    } catch {
      // Not reversible / window closed (the domain guards). The Member's undo is
      // no longer available — a conflict with the action's current state.
      return reply.code(409).send(errorEnvelope('not_reversible', 'This action can no longer be reversed.'));
    }
  });
}
