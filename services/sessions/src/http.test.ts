import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { InMemoryMemberDirectory } from './directory.js';
import { registerSessionRoutes } from './http.js';

const RAMESH_PHONE = '+919800000001';
const RAMESH = 'm-001';

let server: FastifyInstance | undefined;
let store: InMemorySessionStore;

function build(): FastifyInstance {
  // A store that mints predictable tokens so the tests can assert on them.
  let n = 0;
  store = new InMemorySessionStore({}, { newToken: () => `sess-issued-${++n}` });
  const app = createServer({ serviceName: 'sessions-test' });
  registerSessionRoutes(app, {
    directory: new InMemoryMemberDirectory({ [RAMESH_PHONE]: RAMESH }),
    sessions: store,
    now: () => new Date('2026-06-20T00:00:00.000Z'),
  });
  return app;
}

function issue(key: string, phone: string, deviceId: string) {
  return server!.inject({
    method: 'POST',
    url: '/v1/sessions',
    headers: { 'idempotency-key': key, 'content-type': 'application/json' },
    payload: { phone, device_id: deviceId },
  });
}

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('POST /v1/sessions — phone-first re-proof issuance', () => {
  it('issues an opaque, member-scoped token that resolves to the Member', async () => {
    server = build();
    const res = await issue('k1', RAMESH_PHONE, 'dev-1');
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.scope).toBe('member');
    expect(typeof body.server_time).toBe('string');
    expect(body.token).not.toBe(RAMESH); // never the membership id
    // The issued token is a real, resolvable session bound to the device.
    expect(store.resolve(body.token)).toEqual({
      membershipId: RAMESH,
      deviceId: 'dev-1',
      scope: 'member',
    });
  });

  it('issuing on a new device REVOKES the prior device — one active device (FD-S3)', async () => {
    server = build();
    const first = (await issue('k1', RAMESH_PHONE, 'old-phone')).json();
    const second = (await issue('k2', RAMESH_PHONE, 'new-phone')).json();
    expect(store.resolve(second.token)?.deviceId).toBe('new-phone');
    expect(store.resolve(first.token)).toBeUndefined(); // old device signed out
  });

  it('is idempotent: the same key returns the same token, no second session', async () => {
    server = build();
    const a = (await issue('same-key', RAMESH_PHONE, 'dev-1')).json();
    const b = (await issue('same-key', RAMESH_PHONE, 'dev-1')).json();
    expect(b.token).toBe(a.token);
    // Only one session exists; the replay did not re-issue (and did not revoke).
    expect(store.resolve(a.token)?.membershipId).toBe(RAMESH);
  });

  it('default-denies an unrecognised phone (401) — the number alone is not enough', async () => {
    server = build();
    const res = await issue('k1', '+910000000000', 'dev-1');
    expect(res.statusCode).toBe(401);
    expect(res.json().code).toBe('unauthorized');
  });

  it('requires Idempotency-Key (400) and both phone + device_id (400)', async () => {
    server = build();
    const noKey = await server.inject({
      method: 'POST',
      url: '/v1/sessions',
      headers: { 'content-type': 'application/json' },
      payload: { phone: RAMESH_PHONE, device_id: 'dev-1' },
    });
    expect(noKey.statusCode).toBe(400);
    expect(noKey.json().code).toBe('idempotency_key_required');

    const noPhone = await server.inject({
      method: 'POST',
      url: '/v1/sessions',
      headers: { 'idempotency-key': 'k1', 'content-type': 'application/json' },
      payload: { device_id: 'dev-1' },
    });
    expect(noPhone.statusCode).toBe(400);
    expect(noPhone.json().code).toBe('invalid_request');
  });
});
