import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '@nia/runtime';
import { activate, createProspective, pause } from './membership.js';
import { InMemoryMembershipRepository } from './repository.js';
import { registerMembershipRoutes } from './http.js';

const ASOF = new Date('2026-06-20T00:00:00.000Z');
const BORN = new Date('2026-01-04T00:00:00.000Z');

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
  registerMembershipRoutes(app, { repository, now: () => ASOF });
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
      headers: { authorization: 'Bearer m-001' },
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
        headers: { authorization: 'Bearer m-002' },
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

  it('404s when the session maps to no Membership', async () => {
    server = await build();
    const response = await server.inject({
      method: 'GET',
      url: '/v1/membership/me',
      headers: { authorization: 'Bearer nobody' },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json().code).toBe('not_found');
  });
});
