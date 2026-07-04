import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '@nia/runtime';
import {
  applyOfflineWrite,
  InMemoryReconciliationQueue,
  InMemorySyncStore,
  type OfflineWrite,
} from './offline_sync.js';
import { InMemoryOperatorEscalations, InMemoryRemittanceStore } from './remittance_ledger.js';
import { SecretServiceAuthenticator } from './service_auth.js';
import { InMemoryOperatorDirectory } from './operator_auth.js';
import { registerOpsRoutes } from './ops_http.js';

const SECRET = 'ops-secret';
const OP_CRED = 'op-cred-neha';
const T0 = new Date('2026-07-04T00:00:00.000Z');
const svc = (token = SECRET) => ({ 'x-nia-service-token': token });
const op = (cred = OP_CRED) => ({ 'x-nia-operator-token': cred, 'content-type': 'application/json' });

// A money write whose base diverges from the server → conflict_operator.
function divergentMoneyWrite(id: string, payload: unknown = { amount: 900 }): OfflineWrite {
  return { record: { id, recordClass: 'money', updatedAt: 't3', payload }, baseUpdatedAt: 't1' };
}

let server: FastifyInstance | undefined;
let queue: InMemoryReconciliationQueue;
let store: InMemorySyncStore;
let ids: string[];

async function build(): Promise<FastifyInstance> {
  queue = new InMemoryReconciliationQueue();
  ids = [];
  let n = 0;
  store = new InMemorySyncStore([
    { id: 'rec-a', recordClass: 'money', updatedAt: 't2', payload: { amount: 500 } }, // diverged from base t1
    { id: 'rec-b', recordClass: 'money', updatedAt: 't2', payload: { amount: 500 } },
  ]);
  const newId = () => {
    const id = `cf-${++n}`;
    ids.push(id);
    return id;
  };
  await applyOfflineWrite(divergentMoneyWrite('rec-a'), T0, { store, operator: queue, newId });
  await applyOfflineWrite(divergentMoneyWrite('rec-b'), T0, { store, operator: queue, newId });

  const app = createServer({ serviceName: 'recon-test' });
  registerOpsRoutes(app, {
    auth: new SecretServiceAuthenticator([SECRET]),
    remittance: { store: new InMemoryRemittanceStore(), operator: new InMemoryOperatorEscalations() },
    reconciliation: { queue, store, operators: new InMemoryOperatorDirectory({ [OP_CRED]: 'op-neha' }) },
    now: () => T0,
  });
  return app;
}

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Operator reconciliation surface — read (ADR-0015)', () => {
  it('lists every pending money conflict', async () => {
    server = await build();
    const res = await server.inject({ method: 'GET', url: '/v1/ops/reconciliation', headers: svc() });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.conflicts.map((c: { record_id: string }) => c.record_id).sort()).toEqual(['rec-a', 'rec-b']);
    expect(b.conflicts[0]).toMatchObject({ record_class: 'money', proposed_updated_at: 't3', server_updated_at: 't2', status: 'pending' });
    expect(typeof b.conflicts[0].id).toBe('string');
  });

  it('401 without a service token', async () => {
    server = await build();
    expect((await server.inject({ method: 'GET', url: '/v1/ops/reconciliation' })).statusCode).toBe(401);
  });
});

describe('Operator reconciliation surface — resolve (OD-8 / ADR-0019)', () => {
  it('401 without a valid operator credential', async () => {
    server = await build();
    const res = await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: { 'content-type': 'application/json' }, payload: { choice: 'keep_server', reason: 'x' } });
    expect(res.statusCode).toBe(401);
    // A wrong credential is also denied.
    expect((await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op('nope'), payload: { choice: 'keep_server', reason: 'x' } })).statusCode).toBe(401);
  });

  it('accept_proposal makes the client write authoritative and records the operator', async () => {
    server = await build();
    const res = await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'accept_proposal', reason: 'verified with member' } });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.status).toBe('resolved');
    expect(b.resolution).toMatchObject({ choice: 'accept_proposal', operator_id: 'op-neha', reason: 'verified with member', persisted: true });
    // The server record now holds the client's proposed payload.
    expect((await store.get('rec-a'))?.payload).toEqual({ amount: 900 });
    // It drops out of the pending list.
    const pending = (await server.inject({ method: 'GET', url: '/v1/ops/reconciliation', headers: svc() })).json();
    expect(pending.conflicts.map((c: { record_id: string }) => c.record_id)).toEqual(['rec-b']);
  });

  it('keep_server leaves the server unchanged (no write)', async () => {
    server = await build();
    const res = await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'keep_server', reason: 'stale offline write' } });
    expect(res.json().resolution.persisted).toBe(false);
    expect((await store.get('rec-a'))?.payload).toEqual({ amount: 500 }); // untouched
  });

  it('manual writes the corrected amount', async () => {
    server = await build();
    const res = await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'manual', reason: 'reconciled to receipt', payload: { amount: 750 } } });
    expect(res.statusCode).toBe(200);
    expect((await store.get('rec-a'))?.payload).toEqual({ amount: 750 });
  });

  it('rejects a manual resolution with no corrected payload (400)', async () => {
    server = await build();
    expect((await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'manual', reason: 'x' } })).statusCode).toBe(400);
  });

  it('rejects a bad choice or missing reason (400)', async () => {
    server = await build();
    expect((await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'nope', reason: 'x' } })).statusCode).toBe(400);
    expect((await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'keep_server' } })).statusCode).toBe(400);
  });

  it('404 for an unknown conflict; 409 when already resolved', async () => {
    server = await build();
    expect((await server.inject({ method: 'POST', url: '/v1/ops/reconciliation/missing/resolve', headers: op(), payload: { choice: 'keep_server', reason: 'x' } })).statusCode).toBe(404);
    await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'keep_server', reason: 'x' } });
    const twice = await server.inject({ method: 'POST', url: `/v1/ops/reconciliation/${ids[0]}/resolve`, headers: op(), payload: { choice: 'keep_server', reason: 'x' } });
    expect(twice.statusCode).toBe(409);
  });
});
