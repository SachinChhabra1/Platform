import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { activate, createProspective, pause } from './membership.js';
import { InMemoryMembershipRepository } from './repository.js';
import { registerMembershipRoutes } from './http.js';

const ASOF = new Date('2026-06-20T00:00:00.000Z');
const BORN = new Date('2026-01-04T00:00:00.000Z');

// Opaque session tokens — NOT membership ids. SESSION_GHOST resolves to a Member
// id with no stored Membership (the 404 path: a valid session, no record).
const SESSION = 'sess-ramesh-001';
const SESSION_PAUSED = 'sess-sunita';
const SESSION_GHOST = 'sess-ghost';
// A Prospective's limited onboarding-status session (pre_membership scope).
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}` };
const BEARER_PAUSED = { authorization: `Bearer ${SESSION_PAUSED}` };

async function build(): Promise<FastifyInstance> {
  const repository = new InMemoryMembershipRepository();
  await repository.save(
    activate(createProspective({ membershipId: 'm-001', name: 'Ramesh Kumar' }), BORN),
  );
  await repository.save(
    pause(
      activate(createProspective({ membershipId: 'm-002', name: 'Sunita Devi' }), BORN),
      { code: 'medical', recordedBy: { kind: 'operator', operatorId: 'op-9' } },
    ),
  );
  const app = createServer({ serviceName: 'membership-test' });
  registerMembershipRoutes(app, {
    repository,
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: 'm-001', deviceId: 'dev-1' },
      [SESSION_PAUSED]: { membershipId: 'm-002', deviceId: 'dev-2' },
      [SESSION_GHOST]: { membershipId: 'm-ghost', deviceId: 'dev-3' },
      [SESSION_PROSPECT]: {
        membershipId: 'm-001',
        deviceId: 'dev-4',
        scope: 'pre_membership',
      },
    }),
    now: () => ASOF,
  });
  return app;
}

let server: FastifyInstance | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Membership HTTP — GET /membership/me', () => {
  it('returns the signed-in Member identity + state, in snake_case', async () => {
    server = await build();
    const response = await server.inject({
      method: 'GET',
      url: '/v1/membership/me',
      headers: BEARER,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      membership_id: 'm-001',
      name: 'Ramesh Kumar',
      state: 'member',
    });
    expect(response.headers['x-nia-server-time']).toBe(ASOF.toISOString());
  });

  it('NEVER surfaces tenure or operational metadata (FD-3, Q4)', async () => {
    server = await build();
    // A paused Member: the view still carries only identity + state — no
    // relationshipStartedAt, no tenure, no pauseReason/operator id.
    const body = (
      await server.inject({
        method: 'GET',
        url: '/v1/membership/me',
        headers: BEARER_PAUSED,
      })
    ).json();

    expect(Object.keys(body).sort()).toEqual(['membership_id', 'name', 'state']);
    expect(body.state).toBe('paused');
    expect(JSON.stringify(body)).not.toContain('op-9');
    expect(JSON.stringify(body)).not.toContain('tenure');
    expect(JSON.stringify(body)).not.toContain('relationshipStartedAt');
  });

  it('default-denies without a session (401 + envelope)', async () => {
    server = await build();
    const response = await server.inject({ method: 'GET', url: '/v1/membership/me' });
    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body.code).toBe('unauthorized');
    expect(typeof body.correlation_id).toBe('string');
  });

  it('rejects an unknown session token (401) — a membership id is not a token', async () => {
    server = await build();
    for (const token of ['not-a-real-session', 'm-001']) {
      const response = await server.inject({
        method: 'GET',
        url: '/v1/membership/me',
        headers: { authorization: `Bearer ${token}` },
      });
      expect(response.statusCode).toBe(401);
      expect(response.json().code).toBe('unauthorized');
    }
  });

  it('404s when a valid session maps to no Membership', async () => {
    server = await build();
    const response = await server.inject({
      method: 'GET',
      url: '/v1/membership/me',
      headers: { authorization: `Bearer ${SESSION_GHOST}` },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe('not_found');
  });

  it('forbids a pre_membership session — even for a real Member record (FD-S8)', async () => {
    server = await build();
    // SESSION_PROSPECT is bound to m-001 (who HAS a record), so a 403 here proves
    // scope is enforced BEFORE the membership lookup — a Prospective's
    // onboarding-status session never reaches the Membership view (ERR-1).
    const response = await server.inject({
      method: 'GET',
      url: '/v1/membership/me',
      headers: { authorization: `Bearer ${SESSION_PROSPECT}` },
    });
    expect(response.statusCode).toBe(403);
    expect(response.json().code).toBe('forbidden');
  });
});
