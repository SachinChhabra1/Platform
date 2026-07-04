/// HTTP adapter for the read-only Floor surface (R8; contract:
/// packages/types/openapi/openapi.floor.yaml; ruling: ADR-0017 / OD-6).
///
/// A driving adapter over the Floor registry. It is READ-ONLY: `GET /v1/floor`
/// returns the current published version's PUBLIC guarantees. The app never
/// changes the Floor (changes are Founder-owned, made out of band and audited via
/// the registry's append-only history), so there is no mutation route here. The
/// per-Member server-side overrides are deliberately NOT exposed — only the
/// "one Floor for everyone" guarantees.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import type { FloorVersion } from './the_floor.js';
import type { FloorRegistry } from './the_floor_registry.js';

export interface FloorRouteDeps {
  readonly sessions: SessionStore;
  readonly registry: FloorRegistry;
  readonly now?: () => Date;
}

function money(minor: number): Record<string, unknown> {
  return { minor, currency: 'INR' };
}

/// The PUBLIC view — the guarantees plus version/audit provenance. Server-side
/// per-Member overrides are intentionally omitted.
function floorView(v: FloorVersion): Record<string, unknown> {
  return {
    version: v.version,
    effective_at: v.publishedAt,
    note: v.note,
    author: v.author,
    dignity_floor: money(v.values.dignityFloorPaise),
    settlement_floor: money(v.values.settlementFloorPaise),
    women_dignity_floor: money(v.values.womenDignityFloorPaise),
  };
}

function errorEnvelope(code: string, detail: string) {
  return { code, message: detail, correlation_id: randomUUID() };
}

export function registerFloorRoutes(app: FastifyInstance, deps: FloorRouteDeps): void {
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

  app.get(`${API_PREFIX}/floor`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const current = await deps.registry.current();
    if (!current) {
      return reply.code(404).send(errorEnvelope('not_found', 'The Floor is not configured yet.'));
    }
    return reply.code(200).send(floorView(current));
  });
}
