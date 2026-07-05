import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { InMemoryMemberDirectory } from './member_directory.js';
import { registerSessionRoutes } from './session_http.js';

const ASOF = new Date('2026-07-04T09:00:00.000Z');
const PHONE = '+919000000001';
const MEMBER = 'm-1';

let server: FastifyInstance | undefined;
let sessions: InMemorySessionStore;

function build(): FastifyInstance {
  sessions = new InMemorySessionStore();
  const app = createServer({ serviceName: 'sessions-test' });
  registerSessionRoutes(app, {
    sessions,
    directory: new InMemoryMemberDirectory({ [PHONE]: MEMBER }),
    now: () => ASOF,
  });
  return app;
}

const issue = (payload: Record<string, unknown>, key = 'idem-1') =>
  server!.inject({ method: 'POST', url: '/v1/sessions', headers: { 'content-type': 'application/json', 'idempotency-key': key }, payload });

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('POST /v1/sessions — login (phone-first, provisioned directory)', () => {
  it('issues an opaque, resolvable token for a recognised phone', async () => {
    server = build();
    const res = await issue({ phone: PHONE, device_id: 'dev-1' });
    expect(res.statusCode).toBe(201);
    const b = res.json();
    expect(b.scope).toBe('member');
    expect(typeof b.token).toBe('string');
    expect(b.server_time).toBe(ASOF.toISOString());
    // The token resolves to the Member server-side (opaque — never the member id itself).
    expect(sessions.resolve(b.token)?.membershipId).toBe(MEMBER);
    expect(b.token).not.toBe(MEMBER);
    expect(res.headers['x-nia-server-time']).toBe(ASOF.toISOString());
  });

  it('default-denies an unrecognised phone (401) — the number alone is not sufficient', async () => {
    server = build();
    expect((await issue({ phone: '+910000000000', device_id: 'dev-1' })).statusCode).toBe(401);
  });

  it('requires an Idempotency-Key (400)', async () => {
    server = build();
    const res = await server.inject({ method: 'POST', url: '/v1/sessions', headers: { 'content-type': 'application/json' }, payload: { phone: PHONE, device_id: 'dev-1' } });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('idempotency_key_required');
  });

  it('requires phone and device_id (400)', async () => {
    server = build();
    expect((await issue({ phone: PHONE })).statusCode).toBe(400);
    expect((await issue({ device_id: 'dev-1' })).statusCode).toBe(400);
  });

  it('is idempotent — same key replays the same token, no second session', async () => {
    server = build();
    const first = (await issue({ phone: PHONE, device_id: 'dev-1' }, 'k-1')).json().token;
    const replay = (await issue({ phone: PHONE, device_id: 'dev-1' }, 'k-1')).json().token;
    expect(replay).toBe(first);
  });

  it('a new device (new key) issues a fresh token and cuts off the prior one (FD-S3)', async () => {
    server = build();
    const first = (await issue({ phone: PHONE, device_id: 'dev-A' }, 'k-1')).json().token;
    const second = (await issue({ phone: PHONE, device_id: 'dev-B' }, 'k-2')).json().token;
    expect(second).not.toBe(first);
    expect(sessions.resolve(first)).toBeUndefined(); // prior device revoked
    expect(sessions.resolve(second)?.deviceId).toBe('dev-B');
  });
});
