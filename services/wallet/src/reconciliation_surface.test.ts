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
import { registerOpsRoutes } from './ops_http.js';

const SECRET = 'ops-secret';
const T0 = new Date('2026-07-04T00:00:00.000Z');
const svc = (token = SECRET) => ({ 'x-nia-service-token': token });

// A money write whose base diverges from the server → conflict_operator.
function divergentMoneyWrite(id: string): OfflineWrite {
  return { record: { id, recordClass: 'money', updatedAt: 't3', payload: {} }, baseUpdatedAt: 't1' };
}

let server: FastifyInstance | undefined;
let queue: InMemoryReconciliationQueue;

async function build(): Promise<FastifyInstance> {
  queue = new InMemoryReconciliationQueue();
  const store = new InMemorySyncStore([
    { id: 'rec-a', recordClass: 'money', updatedAt: 't2', payload: {} }, // server diverged from base t1
    { id: 'rec-b', recordClass: 'money', updatedAt: 't2', payload: {} },
  ]);
  // Seed two genuine conflicts through the real reconcile path.
  await applyOfflineWrite(divergentMoneyWrite('rec-a'), T0, { store, operator: queue });
  await applyOfflineWrite(divergentMoneyWrite('rec-b'), T0, { store, operator: queue });

  const app = createServer({ serviceName: 'recon-test' });
  registerOpsRoutes(app, {
    auth: new SecretServiceAuthenticator([SECRET]),
    remittance: { store: new InMemoryRemittanceStore(), operator: new InMemoryOperatorEscalations() },
    reconciliation: queue,
    now: () => T0,
  });
  return app;
}

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Operator reconciliation surface — read-only (ADR-0015)', () => {
  it('lists every pending money conflict', async () => {
    server = await build();
    const res = await server.inject({ method: 'GET', url: '/v1/ops/reconciliation', headers: svc() });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.conflicts.map((c: { record_id: string }) => c.record_id).sort()).toEqual(['rec-a', 'rec-b']);
    expect(b.conflicts[0]).toMatchObject({ record_class: 'money', proposed_updated_at: 't3', server_updated_at: 't2' });
  });

  it('lists the conflicts for one record', async () => {
    server = await build();
    const res = await server.inject({ method: 'GET', url: '/v1/ops/reconciliation/rec-a', headers: svc() });
    expect(res.json().conflicts.map((c: { record_id: string }) => c.record_id)).toEqual(['rec-a']);
  });

  it('401 without a service token', async () => {
    server = await build();
    expect((await server.inject({ method: 'GET', url: '/v1/ops/reconciliation' })).statusCode).toBe(401);
  });

  it('offers no mutation route — resolution is OD-8, not yet built', async () => {
    server = await build();
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
      expect((await server.inject({ method, url: '/v1/ops/reconciliation/rec-a', headers: svc() })).statusCode).toBe(404);
    }
  });
});
