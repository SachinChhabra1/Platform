import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { takeAction } from './rafiqi.js';
import { InMemoryGrantStore, InMemoryRafiqiActionStore } from './rafiqi_ledger.js';
import { registerRafiqiRoutes } from './rafiqi_http.js';

const MEMBER = 'm-001';
const OTHER = 'm-002';
const SESSION = 'sess-ramesh';
const SESSION_OTHER = 'sess-other';
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}`, 'content-type': 'application/json' };
const ASOF = new Date('2026-07-04T09:00:00.000Z');
const HOURS = (n: number): number => n * 60 * 60 * 1000;

let server: FastifyInstance | undefined;
let grants: InMemoryGrantStore;
let actions: InMemoryRafiqiActionStore;
let counter: number;
let clock: Date;

function build(): FastifyInstance {
  grants = new InMemoryGrantStore();
  actions = new InMemoryRafiqiActionStore();
  counter = 0;
  clock = ASOF;
  const app = createServer({ serviceName: 'rafiqi-test' });
  registerRafiqiRoutes(app, {
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' },
      [SESSION_OTHER]: { membershipId: OTHER, deviceId: 'dev-2' },
      [SESSION_PROSPECT]: { membershipId: 'm-pros', deviceId: 'dev-3', scope: 'pre_membership' },
    }),
    grants,
    actions,
    now: () => clock,
    newId: () => `g-${++counter}`,
  });
  return app;
}

const post = (url: string, payload: Record<string, unknown>, bearer = BEARER) =>
  server!.inject({ method: 'POST', url, headers: bearer, payload });
const get = (url: string, bearer = BEARER) =>
  server!.inject({ method: 'GET', url, headers: { authorization: bearer.authorization } });
// Bodyless POST (revoke/reverse) — no JSON content-type since there is no body.
const act = (url: string, bearer = BEARER) =>
  server!.inject({ method: 'POST', url, headers: { authorization: bearer.authorization } });

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('RafiQi HTTP — grants (explicit, scoped, revocable)', () => {
  it('grants a standing authorisation with a server-computed expiry', async () => {
    server = build();
    const res = await post('/v1/rafiqi/grants', {
      action_type: 'store_swap',
      cap: { minor: 50_000, currency: 'INR' },
      ttl_ms: HOURS(24 * 30),
    });
    expect(res.statusCode).toBe(201);
    const b = res.json();
    expect(b.id).toBe('g-1');
    expect(b.action_type).toBe('store_swap');
    expect(b.cap).toEqual({ minor: 50_000, currency: 'INR' });
    expect(b.granted_at).toBe(ASOF.toISOString());
    expect(b.expires_at).toBe(new Date(ASOF.getTime() + HOURS(24 * 30)).toISOString());
    expect(b.revoked_at).toBeUndefined();
  });

  it('rejects a malformed grant (400)', async () => {
    server = build();
    for (const payload of [
      { cap: { minor: 1, currency: 'INR' }, ttl_ms: 1 }, // missing action_type
      { action_type: 'x', cap: { minor: 0, currency: 'INR' }, ttl_ms: 1 }, // non-positive cap
      { action_type: 'x', cap: { minor: 1, currency: 'INR' }, ttl_ms: 0 }, // non-positive ttl
    ]) {
      expect((await post('/v1/rafiqi/grants', payload)).statusCode).toBe(400);
    }
  });

  it('revokes a grant; the revoked grant carries revoked_at', async () => {
    server = build();
    await post('/v1/rafiqi/grants', { action_type: 'store_swap', cap: { minor: 50_000, currency: 'INR' }, ttl_ms: HOURS(24) });
    const res = await act('/v1/rafiqi/grants/g-1/revoke');
    expect(res.statusCode).toBe(200);
    expect(res.json().revoked_at).toBe(ASOF.toISOString());
  });

  it('lists the Member\'s grants (transparency)', async () => {
    server = build();
    await post('/v1/rafiqi/grants', { action_type: 'a', cap: { minor: 1, currency: 'INR' }, ttl_ms: 1000 });
    await post('/v1/rafiqi/grants', { action_type: 'b', cap: { minor: 1, currency: 'INR' }, ttl_ms: 1000 });
    const b = (await get('/v1/rafiqi/grants')).json();
    expect(b.grants.map((g: { id: string }) => g.id).sort()).toEqual(['g-1', 'g-2']);
  });
});

describe('RafiQi HTTP — action reversal within the 24h window', () => {
  // RafiQi (the orchestrator) takes the action; the Member reverses via HTTP.
  async function seedAction(id: string, member = MEMBER, takenAt = ASOF): Promise<void> {
    await actions.save(
      takeAction({ id, membershipId: member, actionType: 'store_swap', amountPaise: 30_000, now: takenAt, via: { kind: 'auto', grantId: 'g-1' } }),
    );
  }

  it('reverses an action inside the window (200) and records it', async () => {
    server = build();
    await seedAction('a-1');
    clock = new Date(ASOF.getTime() + HOURS(5));
    const res = await act('/v1/rafiqi/actions/a-1/reverse');
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.state).toBe('reversed');
    expect(b.history.map((e: { type: string }) => e.type)).toEqual(['taken', 'reversed']);
    expect((await actions.get('a-1'))?.state).toBe('reversed');
  });

  it('returns 409 once the 24h window has closed', async () => {
    server = build();
    await seedAction('a-2');
    clock = new Date(ASOF.getTime() + HOURS(25));
    const res = await act('/v1/rafiqi/actions/a-2/reverse');
    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('not_reversible');
  });

  it('reads an action with its audit history by id', async () => {
    server = build();
    await seedAction('a-3');
    const b = (await get('/v1/rafiqi/actions/a-3')).json();
    expect(b.id).toBe('a-3');
    expect(b.authorization).toBe('auto');
    expect(b.grant_id).toBe('g-1');
    expect(b.state).toBe('reversible');
  });
});

describe('RafiQi HTTP — access control', () => {
  it('default-denies without a session (401)', async () => {
    server = build();
    const res = await server.inject({
      method: 'POST',
      url: '/v1/rafiqi/grants',
      headers: { 'content-type': 'application/json' },
      payload: { action_type: 'x', cap: { minor: 1, currency: 'INR' }, ttl_ms: 1 },
    });
    expect(res.statusCode).toBe(401);
  });

  it('forbids a pre_membership session (403)', async () => {
    server = build();
    const res = await post(
      '/v1/rafiqi/grants',
      { action_type: 'x', cap: { minor: 1, currency: 'INR' }, ttl_ms: 1 },
      { authorization: `Bearer ${SESSION_PROSPECT}`, 'content-type': 'application/json' },
    );
    expect(res.statusCode).toBe(403);
  });

  it('another Member cannot revoke or read your grant/action (404, no leak)', async () => {
    server = build();
    await post('/v1/rafiqi/grants', { action_type: 'x', cap: { minor: 1, currency: 'INR' }, ttl_ms: 1000 }); // g-1, MEMBER
    actions.save(takeAction({ id: 'a-x', membershipId: MEMBER, actionType: 'x', amountPaise: 100, now: ASOF, via: { kind: 'confirmed' } }));
    const other = { authorization: `Bearer ${SESSION_OTHER}` };
    expect((await server.inject({ method: 'POST', url: '/v1/rafiqi/grants/g-1/revoke', headers: other })).statusCode).toBe(404);
    expect((await server.inject({ method: 'GET', url: '/v1/rafiqi/actions/a-x', headers: other })).statusCode).toBe(404);
    expect((await server.inject({ method: 'POST', url: '/v1/rafiqi/actions/a-x/reverse', headers: other })).statusCode).toBe(404);
  });
});
