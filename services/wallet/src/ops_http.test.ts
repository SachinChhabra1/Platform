import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '@nia/runtime';
import { initiateRemittance, markSent } from './remittance.js';
import {
  InMemoryOperatorEscalations,
  InMemoryRemittanceStore,
  sweepRemittanceSla,
} from './remittance_ledger.js';
import { SecretServiceAuthenticator } from './service_auth.js';
import { registerOpsRoutes } from './ops_http.js';

const SECRET = 'ops-secret';
const T0 = new Date('2026-07-04T00:00:00.000Z');
const HOURS = (n: number): number => n * 60 * 60 * 1000;
const svc = (token = SECRET) => ({ 'x-nia-service-token': token });

function remittance(id: string, initiatedAt: Date, sent = false) {
  const r = initiateRemittance({ id, membershipId: `mem-${id}`, recipientId: 'fam', amount: { minor: 100000, currency: 'INR' }, now: initiatedAt });
  return sent ? markSent(r, initiatedAt) : r;
}

describe('sweepRemittanceSla — escalates breached, idempotent', () => {
  it('escalates only the unconfirmed remittances past their 24h SLA', async () => {
    const store = new InMemoryRemittanceStore();
    const operator = new InMemoryOperatorEscalations();
    // old-1 & old-2 initiated 25h ago (breached); fresh initiated now (fine).
    await store.save(remittance('old-1', new Date(T0.getTime() - HOURS(25))));
    await store.save(remittance('old-2', new Date(T0.getTime() - HOURS(30)), true));
    await store.save(remittance('fresh', T0));

    const result = await sweepRemittanceSla(T0, { store, operator });
    expect(result.scanned).toBe(3);
    expect([...result.escalated].sort()).toEqual(['old-1', 'old-2']);
    expect((await store.get('old-1'))?.state).toBe('escalated');
    expect((await store.get('fresh'))?.state).toBe('initiated');
    expect(await operator.listForRemittance('old-1')).toHaveLength(1);
  });

  it('is idempotent — a second sweep escalates nothing new and does not re-raise', async () => {
    const store = new InMemoryRemittanceStore();
    const operator = new InMemoryOperatorEscalations();
    await store.save(remittance('old-1', new Date(T0.getTime() - HOURS(25))));
    await sweepRemittanceSla(T0, { store, operator });
    const again = await sweepRemittanceSla(T0, { store, operator });
    expect(again.escalated).toEqual([]);
    expect(again.scanned).toBe(0); // escalated remittance is no longer "unconfirmed"
    expect(await operator.listForRemittance('old-1')).toHaveLength(1); // not re-raised
  });
});

describe('Ops HTTP — remittance SLA sweep (service-authed)', () => {
  let server: FastifyInstance | undefined;
  let store: InMemoryRemittanceStore;
  let operator: InMemoryOperatorEscalations;

  function build(): FastifyInstance {
    store = new InMemoryRemittanceStore();
    operator = new InMemoryOperatorEscalations();
    const app = createServer({ serviceName: 'ops-test' });
    registerOpsRoutes(app, { auth: new SecretServiceAuthenticator([SECRET]), remittance: { store, operator }, now: () => T0 });
    return app;
  }
  const post = (headers = svc()) => server!.inject({ method: 'POST', url: '/v1/ops/remittance-sla-sweep', headers });

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('401 without a valid service token', async () => {
    server = build();
    expect((await post(svc('wrong'))).statusCode).toBe(401);
    expect((await server.inject({ method: 'POST', url: '/v1/ops/remittance-sla-sweep' })).statusCode).toBe(401);
  });

  it('runs the sweep and returns the summary', async () => {
    server = build();
    await store.save(remittance('old-1', new Date(T0.getTime() - HOURS(25))));
    await store.save(remittance('fresh', T0));
    const res = await post();
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ scanned: 2, escalated: ['old-1'] });
    expect(res.headers['x-nia-server-time']).toBe(T0.toISOString());
    expect(await operator.listForRemittance('old-1')).toHaveLength(1);
  });
});
