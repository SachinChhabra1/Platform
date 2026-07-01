import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { InMemorySessionStore } from '@nia/runtime';
import {
  InMemoryWalletActivitySource,
  rupees,
  type WalletActivity,
} from '@nia/wallet';
import {
  activate,
  createProspective,
  InMemoryMembershipRepository,
} from '@nia/membership';
import { InMemoryMemberDirectory } from '@nia/sessions';
import {
  createPreviewServer,
  seededPreviewServer,
  DEMO_MEMBER,
  DEMO_SESSION,
  DEMO_PAUSED_SESSION,
  DEMO_CLOSED_SESSION,
  DEMO_PHONE,
} from './server.js';

const BEARER = { authorization: `Bearer ${DEMO_SESSION}` };

let server: FastifyInstance | undefined;
afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Developer Preview backend — both surfaces on one origin', () => {
  it('serves the Wallet Overview (two distinct §3 figures) for the demo session', async () => {
    server = await seededPreviewServer({ now: () => new Date('2026-06-20T00:00:00.000Z') });
    const res = await server.inject({ method: 'GET', url: '/v1/wallet/overview', headers: BEARER });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.available_balance.minor).toBe(348_000);
    expect(body.stayed_this_month.minor).toBe(480_000);
    expect(body.available_balance.minor).not.toBe(body.stayed_this_month.minor);
  });

  it('serves the Member identity (name + state) for the SAME session', async () => {
    server = await seededPreviewServer();
    const res = await server.inject({ method: 'GET', url: '/v1/membership/me', headers: BEARER });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      membership_id: DEMO_MEMBER,
      name: 'Ramesh Kumar',
      state: 'member',
    });
  });

  it('serves the paused and closed demo Members so every standing is walkable', async () => {
    server = await seededPreviewServer();
    const paused = await server.inject({
      method: 'GET', url: '/v1/membership/me',
      headers: { authorization: `Bearer ${DEMO_PAUSED_SESSION}` },
    });
    expect(paused.json().state).toBe('paused');
    const closed = await server.inject({
      method: 'GET', url: '/v1/membership/me',
      headers: { authorization: `Bearer ${DEMO_CLOSED_SESSION}` },
    });
    expect(closed.json().state).toBe('closed');
  });

  it('runs the whole journey on one origin: POST /v1/sessions → read Wallet + Membership', async () => {
    server = await seededPreviewServer({ now: () => new Date('2026-06-20T00:00:00.000Z') });
    // Phone → session issued.
    const issued = await server.inject({
      method: 'POST',
      url: '/v1/sessions',
      headers: { 'idempotency-key': 'k1', 'content-type': 'application/json' },
      payload: { phone: DEMO_PHONE, device_id: 'dev-web' },
    });
    expect(issued.statusCode).toBe(201);
    const token = issued.json().token as string;
    expect(token).not.toBe(DEMO_MEMBER);
    // The issued token reads the real surfaces.
    const auth = { authorization: `Bearer ${token}` };
    const me = await server.inject({ method: 'GET', url: '/v1/membership/me', headers: auth });
    expect(me.json()).toMatchObject({ name: 'Ramesh Kumar', state: 'member' });
    const wallet = await server.inject({ method: 'GET', url: '/v1/wallet/overview', headers: auth });
    expect(wallet.json().available_balance.minor).toBe(348_000);
    // Issuing revoked the seeded token for that Member (one active device, FD-S3).
    const oldTokenNow = await server.inject({
      method: 'GET', url: '/v1/membership/me',
      headers: { authorization: `Bearer ${DEMO_SESSION}` },
    });
    expect(oldTokenNow.statusCode).toBe(401);
  });

  it('answers the health probe (one process is up for both surfaces)', async () => {
    server = await seededPreviewServer();
    const res = await server.inject({ method: 'GET', url: '/v1/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');
  });

  it('default-denies both surfaces without a session (401)', async () => {
    server = await seededPreviewServer();
    for (const url of ['/v1/wallet/overview', '/v1/membership/me']) {
      const res = await server.inject({ method: 'GET', url });
      expect(res.statusCode).toBe(401);
    }
  });

  it('forbids a pre_membership session on both surfaces (403, FD-S8)', async () => {
    const repository = new InMemoryMembershipRepository();
    await repository.save(
      activate(createProspective({ membershipId: DEMO_MEMBER, name: 'Ramesh Kumar' }),
        new Date('2026-01-04T00:00:00.000Z')),
    );
    const log: readonly WalletActivity[] = [
      { id: 'w', occurredOn: '2026-06-01', category: 'wage', direction: 'in',
        amount: rupees(14000), affectsAvailable: true, changesHoldings: true },
    ];
    server = createPreviewServer({
      source: new InMemoryWalletActivitySource({ [DEMO_MEMBER]: log }),
      repository,
      sessions: new InMemorySessionStore({
        'sess-pros': { membershipId: DEMO_MEMBER, deviceId: 'dev-x', scope: 'pre_membership' },
      }),
      directory: new InMemoryMemberDirectory({}),
    });
    for (const url of ['/v1/wallet/overview', '/v1/membership/me']) {
      const res = await server.inject({
        method: 'GET', url, headers: { authorization: 'Bearer sess-pros' },
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().code).toBe('forbidden');
    }
  });
});
