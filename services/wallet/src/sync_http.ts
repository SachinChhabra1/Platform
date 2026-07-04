/// HTTP adapter for offline write reconciliation (R6; contract:
/// packages/types/openapi/openapi.sync.yaml; ruling: ADR-0015 / OD-4).
///
/// A driving adapter over `applyOfflineWrite`. It adds NO policy: it resolves the
/// Member (default-deny), validates the batch, reconciles each write by its record
/// class, and returns per-write outcomes. Money conflicts are queued to the
/// Operator by the domain, never applied here.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import {
  applyOfflineWrite,
  type OfflineWrite,
  type RecordClass,
  type ReconciliationQueue,
  type SyncStore,
} from './offline_sync.js';

export interface SyncRouteDeps {
  readonly sessions: SessionStore;
  readonly store: SyncStore;
  readonly operator: ReconciliationQueue;
  readonly now?: () => Date;
}

const RECORD_CLASSES: ReadonlySet<RecordClass> = new Set<RecordClass>(['money', 'intent', 'append_only']);

function errorEnvelope(code: string, detail: string) {
  return { code, message: detail, correlation_id: randomUUID() };
}

type ParsedBatch =
  | { readonly ok: true; readonly writes: readonly OfflineWrite[] }
  | { readonly ok: false; readonly code: string; readonly detail: string };

function parseWrite(raw: unknown): OfflineWrite | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const w = raw as { record?: unknown; base_updated_at?: unknown };
  if (typeof w.record !== 'object' || w.record === null) return null;
  const r = w.record as { id?: unknown; record_class?: unknown; updated_at?: unknown; payload?: unknown };
  if (typeof r.id !== 'string' || r.id.length === 0) return null;
  if (typeof r.record_class !== 'string' || !RECORD_CLASSES.has(r.record_class as RecordClass)) return null;
  if (typeof r.updated_at !== 'string' || r.updated_at.length === 0) return null;
  if (typeof r.payload !== 'object' || r.payload === null) return null;
  if (w.base_updated_at !== undefined && typeof w.base_updated_at !== 'string') return null;
  return {
    record: {
      id: r.id,
      recordClass: r.record_class as RecordClass,
      updatedAt: r.updated_at,
      payload: r.payload,
    },
    ...(w.base_updated_at !== undefined ? { baseUpdatedAt: w.base_updated_at } : {}),
  };
}

function parseBatch(body: unknown): ParsedBatch {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'invalid_request', detail: 'Body must be a JSON object.' };
  }
  const writesRaw = (body as { writes?: unknown }).writes;
  if (!Array.isArray(writesRaw)) {
    return { ok: false, code: 'invalid_writes', detail: "Field 'writes' must be an array." };
  }
  const writes: OfflineWrite[] = [];
  for (const raw of writesRaw) {
    const w = parseWrite(raw);
    if (w === null) {
      return { ok: false, code: 'invalid_write', detail: 'Each write needs record {id, record_class, updated_at, payload}.' };
    }
    writes.push(w);
  }
  return { ok: true, writes };
}

export function registerSyncRoutes(app: FastifyInstance, deps: SyncRouteDeps): void {
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

  app.post(`${API_PREFIX}/sync`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;

    const parsed = parseBatch(request.body);
    if (!parsed.ok) {
      return reply.code(400).send(errorEnvelope(parsed.code, parsed.detail));
    }

    const at = now();
    const results: { id: string; outcome: string }[] = [];
    for (const write of parsed.writes) {
      const outcome = await applyOfflineWrite(write, at, { store: deps.store, operator: deps.operator });
      results.push({ id: write.record.id, outcome });
    }
    return reply.code(200).send({ results });
  });
}
