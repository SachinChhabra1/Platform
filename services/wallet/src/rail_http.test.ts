import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '@nia/runtime';
import { initiateRemittance, markRecipientAvailable, markSent, checkSla, type Remittance } from './remittance.js';
import { InMemoryRemittanceStore } from './remittance_ledger.js';
import { SecretServiceAuthenticator } from './service_auth.js';
import { registerRemittanceRailRoutes } from './rail_http.js';

const MEMBER = 'm-001';
const SECRET = 'rail-secret-xyz';
const ASOF = new Date('2026-07-04T09:00:00.000Z');
const HOURS = (n: number): number => n * 60 * 60 * 1000;
const svc = (token = SECRET) => ({ 'x-nia-service-token': token });

let server: FastifyInstance | undefined;
let store: InMemoryRemittanceStore;
let clock: Date;

function build(): FastifyInstance {
  store = new InMemoryRemittanceStore();
  clock = ASOF;
  const app = createServer({ serviceName: 'rail-test' });
  registerRemittanceRailRoutes(app, {
    store,
    auth: new SecretServiceAuthenticator([SECRET]),
    now: () => clock,
  });
  return app;
}

async function seed(state: 'initiated' | 'in_transit' | 'confirmed_available' | 'escalated'): Promise<Remittance> {
  let r = initiateRemittance({ id: 'r-1', membershipId: MEMBER, recipientId: 'fam-1', amount: { minor: 500000, currency: 'INR' }, now: ASOF });
  if (state === 'in_transit') r = markSent(r, ASOF);
  if (state === 'confirmed_available') r = markRecipientAvailable(markSent(r, ASOF), ASOF);
  if (state === 'escalated') r = checkSla(r, new Date(ASOF.getTime() + HOURS(25))); // SLA breached, unconfirmed
  await store.save(r);
  return r;
}

const post = (path: string, headers = svc()) => server!.inject({ method: 'POST', url: path, headers });

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Rail webhooks — service auth (not a Member session)', () => {
  it('401 without a service token', async () => {
    server = build();
    await seed('initiated');
    expect((await server.inject({ method: 'POST', url: '/v1/rail/remittances/r-1/sent' })).statusCode).toBe(401);
  });

  it('401 with a wrong service token', async () => {
    server = build();
    await seed('initiated');
    expect((await post('/v1/rail/remittances/r-1/sent', svc('nope'))).statusCode).toBe(401);
  });

  it('404 for an unknown remittance (even with a valid token)', async () => {
    server = build();
    expect((await post('/v1/rail/remittances/missing/sent')).statusCode).toBe(404);
  });
});

describe('Rail webhooks — transitions (ADR-0013), idempotent', () => {
  it('sent: initiated → in_transit, then idempotent', async () => {
    server = build();
    await seed('initiated');
    const res = await post('/v1/rail/remittances/r-1/sent');
    expect(res.statusCode).toBe(200);
    expect(res.json().state).toBe('in_transit');
    expect(res.headers['x-nia-server-time']).toBe(ASOF.toISOString());
    // re-delivery is a no-op 200 (still in_transit, no duplicate 'sent' event)
    const again = await post('/v1/rail/remittances/r-1/sent');
    expect(again.statusCode).toBe(200);
    expect(again.json().history.filter((e: { type: string }) => e.type === 'sent')).toHaveLength(1);
  });

  it('recipient-available confirms ("Reached home"), then idempotent', async () => {
    server = build();
    await seed('in_transit');
    const res = await post('/v1/rail/remittances/r-1/recipient-available');
    expect(res.statusCode).toBe(200);
    expect(res.json().state).toBe('confirmed_available');
    expect((await post('/v1/rail/remittances/r-1/recipient-available')).statusCode).toBe(200); // idempotent
  });

  it('settled: confirmed → settled, then idempotent', async () => {
    server = build();
    await seed('confirmed_available');
    expect((await post('/v1/rail/remittances/r-1/settled')).json().state).toBe('settled');
    expect((await post('/v1/rail/remittances/r-1/settled')).statusCode).toBe(200);
  });

  it('409 when settling before confirmation', async () => {
    server = build();
    await seed('in_transit');
    const res = await post('/v1/rail/remittances/r-1/settled');
    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('invalid_transition');
  });

  it('409 when the rail tries to confirm an escalated remittance (the Operator owns it)', async () => {
    server = build();
    await seed('escalated');
    expect((await post('/v1/rail/remittances/r-1/recipient-available')).statusCode).toBe(409);
  });
});
