import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { InMemoryReconciliationQueue, InMemorySyncStore, type SyncRecord } from './offline_sync.js';
import { registerSyncRoutes } from './sync_http.js';

const MEMBER = 'm-001';
const SESSION = 'sess-ramesh';
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}`, 'content-type': 'application/json' };
const ASOF = new Date('2026-07-04T12:00:00.000Z');

let server: FastifyInstance | undefined;
let store: InMemorySyncStore;
let operator: InMemoryReconciliationQueue;

function build(seed: readonly SyncRecord[] = []): FastifyInstance {
  store = new InMemorySyncStore(seed);
  operator = new InMemoryReconciliationQueue();
  const app = createServer({ serviceName: 'sync-test' });
  registerSyncRoutes(app, {
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' },
      [SESSION_PROSPECT]: { membershipId: 'm-pros', deviceId: 'dev-2', scope: 'pre_membership' },
    }),
    store,
    operator,
    now: () => ASOF,
  });
  return app;
}

const sync = (payload: Record<string, unknown>, bearer = BEARER) =>
  server!.inject({ method: 'POST', url: '/v1/sync', headers: bearer, payload });

const money = (id: string, updatedAt: string, base?: string) => ({
  record: { id, record_class: 'money', updated_at: updatedAt, payload: {} },
  ...(base !== undefined ? { base_updated_at: base } : {}),
});
const intent = (id: string, updatedAt: string) => ({
  record: { id, record_class: 'intent', updated_at: updatedAt, payload: { v: updatedAt } },
});
const log = (id: string, updatedAt: string) => ({
  record: { id, record_class: 'append_only', updated_at: updatedAt, payload: {} },
});

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Sync HTTP — batch reconciliation per record class (ADR-0015)', () => {
  it('returns a per-write outcome for each class', async () => {
    server = build([{ id: 'p-1', recordClass: 'intent', updatedAt: '2026-07-04T10:00:00.000Z', payload: {} }]);
    const res = await sync({
      writes: [
        intent('p-1', '2026-07-04T11:00:00.000Z'), // newer → applied
        intent('p-1', '2026-07-04T09:00:00.000Z'), // now older than the just-applied → kept_server
        log('l-1', '2026-07-04T10:00:00.000Z'), // new → merged
        money('m-1', '2026-07-04T11:00:00.000Z'), // no server → applied
      ],
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().results).toEqual([
      { id: 'p-1', outcome: 'applied' },
      { id: 'p-1', outcome: 'kept_server' },
      { id: 'l-1', outcome: 'merged' },
      { id: 'm-1', outcome: 'applied' },
    ]);
  });

  it('a diverged money write returns conflict_operator, queues it, and leaves the server', async () => {
    server = build([{ id: 'm-9', recordClass: 'money', updatedAt: '2026-07-04T10:30:00.000Z', payload: { balance: 500 } }]);
    const res = await sync({ writes: [money('m-9', '2026-07-04T11:00:00.000Z', '2026-07-04T10:00:00.000Z')] });
    expect(res.json().results).toEqual([{ id: 'm-9', outcome: 'conflict_operator' }]);
    // Server money untouched; conflict on the Operator queue.
    expect((await store.get('m-9'))?.payload).toEqual({ balance: 500 });
    expect((await operator.listForRecord('m-9'))).toHaveLength(1);
  });

  it('rejects a malformed batch (400)', async () => {
    server = build();
    for (const payload of [
      {}, // no writes
      { writes: 'nope' }, // not an array
      { writes: [{ record: { id: 'x', record_class: 'bogus', updated_at: 't', payload: {} } }] }, // bad class
      { writes: [{ record: { id: 'x', updated_at: 't', payload: {} } }] }, // missing class
    ]) {
      expect((await sync(payload)).statusCode).toBe(400);
    }
  });
});

describe('Sync HTTP — access control', () => {
  it('default-denies without a session (401)', async () => {
    server = build();
    const res = await server.inject({
      method: 'POST',
      url: '/v1/sync',
      headers: { 'content-type': 'application/json' },
      payload: { writes: [] },
    });
    expect(res.statusCode).toBe(401);
  });

  it('forbids a pre_membership session (403)', async () => {
    server = build();
    const res = await sync({ writes: [] }, { authorization: `Bearer ${SESSION_PROSPECT}`, 'content-type': 'application/json' });
    expect(res.statusCode).toBe(403);
  });

  it('stamps the server-time header', async () => {
    server = build();
    const res = await sync({ writes: [] });
    expect(res.headers['x-nia-server-time']).toBe(ASOF.toISOString());
  });
});
