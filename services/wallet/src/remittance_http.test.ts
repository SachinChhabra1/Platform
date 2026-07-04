import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { markRecipientAvailable, markSent } from './remittance.js';
import { InMemoryRemittanceStore } from './remittance_ledger.js';
import { registerRemittanceRoutes } from './remittance_http.js';

const MEMBER = 'm-001';
const OTHER = 'm-002';
const SESSION = 'sess-ramesh';
const SESSION_OTHER = 'sess-other';
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}`, 'content-type': 'application/json' };
const ASOF = new Date('2026-07-04T09:00:00.000Z');

let server: FastifyInstance | undefined;
let store: InMemoryRemittanceStore;
let counter: number;

function build(): FastifyInstance {
  store = new InMemoryRemittanceStore();
  counter = 0;
  const app = createServer({ serviceName: 'remittance-test' });
  registerRemittanceRoutes(app, {
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' },
      [SESSION_OTHER]: { membershipId: OTHER, deviceId: 'dev-2' },
      [SESSION_PROSPECT]: { membershipId: 'm-pros', deviceId: 'dev-3', scope: 'pre_membership' },
    }),
    store,
    now: () => ASOF,
    newId: () => `rem-${++counter}`,
  });
  return app;
}

const send = (payload: Record<string, unknown>, bearer = BEARER) =>
  server!.inject({ method: 'POST', url: '/v1/remittances', headers: bearer, payload });

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Remittance HTTP — initiate', () => {
  it('begins a remittance: initiated, not confirmed, with a 24h SLA deadline', async () => {
    server = build();
    const res = await send({ recipient_id: 'fam-anita', amount: { minor: 500_000, currency: 'INR' }, settlement_id: 's-42' });
    expect(res.statusCode).toBe(201);
    const b = res.json();
    expect(b.id).toBe('rem-1');
    expect(b.state).toBe('initiated'); // NOT confirmed
    expect(b.settlement_id).toBe('s-42');
    expect(b.escalate_after).toBe('2026-07-05T09:00:00.000Z'); // +24h
    expect(b.history.map((e: { type: string }) => e.type)).toEqual(['initiated']);
    expect(res.headers['x-nia-server-time']).toBe(ASOF.toISOString());
    // Persisted for audit.
    expect((await store.get('rem-1'))?.membershipId).toBe(MEMBER);
  });

  it('rejects a malformed body (400)', async () => {
    server = build();
    for (const payload of [
      { amount: { minor: 500_000, currency: 'INR' } }, // missing recipient
      { recipient_id: 'fam', amount: { minor: 0, currency: 'INR' } }, // non-positive
      { recipient_id: 'fam', amount: { minor: 1.5, currency: 'INR' } }, // non-integer
    ]) {
      expect((await send(payload)).statusCode).toBe(400);
    }
  });
});

describe('Remittance HTTP — read reflects rail-driven confirmation (auditable by id)', () => {
  it('shows confirmed_available only after the rail confirms — never from "sent"', async () => {
    server = build();
    await send({ recipient_id: 'fam-anita', amount: { minor: 500_000, currency: 'INR' } });

    // The rail marks it sent (in_transit) — the read must NOT show confirmed.
    await store.save(markSent((await store.get('rem-1'))!, new Date('2026-07-04T10:00:00.000Z')));
    let b = (await server.inject({ method: 'GET', url: '/v1/remittances/rem-1', headers: BEARER })).json();
    expect(b.state).toBe('in_transit');

    // The rail confirms recipient-available — now the read shows "Reached home".
    await store.save(markRecipientAvailable((await store.get('rem-1'))!, new Date('2026-07-04T11:00:00.000Z')));
    b = (await server.inject({ method: 'GET', url: '/v1/remittances/rem-1', headers: BEARER })).json();
    expect(b.state).toBe('confirmed_available');
    expect(b.history.map((e: { type: string }) => e.type)).toEqual(['initiated', 'sent', 'recipient_available']);
  });

  it('lists the Member\'s remittances', async () => {
    server = build();
    await send({ recipient_id: 'fam-a', amount: { minor: 100_000, currency: 'INR' } });
    await send({ recipient_id: 'fam-b', amount: { minor: 200_000, currency: 'INR' } });
    const b = (await server.inject({ method: 'GET', url: '/v1/remittances', headers: BEARER })).json();
    expect(b.remittances.map((r: { id: string }) => r.id).sort()).toEqual(['rem-1', 'rem-2']);
  });
});

describe('Remittance HTTP — access control', () => {
  it('default-denies without a session (401)', async () => {
    server = build();
    const res = await server.inject({
      method: 'POST',
      url: '/v1/remittances',
      headers: { 'content-type': 'application/json' },
      payload: { recipient_id: 'fam', amount: { minor: 100_000, currency: 'INR' } },
    });
    expect(res.statusCode).toBe(401);
  });

  it('forbids a pre_membership session (403)', async () => {
    server = build();
    const res = await send(
      { recipient_id: 'fam', amount: { minor: 100_000, currency: 'INR' } },
      { authorization: `Bearer ${SESSION_PROSPECT}`, 'content-type': 'application/json' },
    );
    expect(res.statusCode).toBe(403);
  });

  it('another Member\'s remittance reads as 404 (ownership does not leak)', async () => {
    server = build();
    await send({ recipient_id: 'fam', amount: { minor: 100_000, currency: 'INR' } }); // rem-1, owned by MEMBER
    const res = await server.inject({
      method: 'GET',
      url: '/v1/remittances/rem-1',
      headers: { authorization: `Bearer ${SESSION_OTHER}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
