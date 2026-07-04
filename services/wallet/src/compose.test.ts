import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { FastifyInstance } from 'fastify';
import { InMemorySessionStore } from '@nia/runtime';
import { composeWalletApp } from './compose.js';
import type { WalletConfig } from './config.js';

const T0 = new Date('2026-07-04T00:00:00.000Z');
const SESSION = 'sess-m1';
const bearer = { authorization: `Bearer ${SESSION}` };
const svc = (token: string) => ({ 'x-nia-service-token': token });

let dir: string;
let server: FastifyInstance | undefined;

function baseConfig(over: Partial<WalletConfig> = {}): WalletConfig {
  return {
    host: '127.0.0.1',
    port: 0,
    dataDir: dir,
    serviceTokens: [],
    recoveryCapBps: 0,
    savingsSettleMs: 0,
    floorSeed: undefined,
    ...over,
  };
}

function sessions() {
  return new InMemorySessionStore({ [SESSION]: { membershipId: 'm-1', deviceId: 'd-1' } });
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'nia-compose-'));
});
afterEach(async () => {
  await server?.close();
  server = undefined;
  rmSync(dir, { recursive: true, force: true });
});

describe('composeWalletApp — Founder-config seams wired', () => {
  it('with no floor seed, the Floor endpoint is unconfigured (404)', async () => {
    server = await composeWalletApp(baseConfig(), { sessions: sessions(), now: () => T0 });
    expect((await server.inject({ method: 'GET', url: '/v1/floor', headers: bearer })).statusCode).toBe(404);
  });

  it('seeds the Floor from config and serves it read-only', async () => {
    const floorSeed = {
      values: { dignityFloorPaise: 2000, settlementFloorPaise: 10000, womenDignityFloorPaise: 3000, overridesByMember: {} },
      author: 'founder',
      note: 'v1',
    };
    server = await composeWalletApp(baseConfig({ floorSeed }), { sessions: sessions(), now: () => T0 });
    const res = await server.inject({ method: 'GET', url: '/v1/floor', headers: bearer });
    expect(res.statusCode).toBe(200);
    expect(res.json().dignity_floor).toEqual({ minor: 2000, currency: 'INR' });
  });

  it('wage settlement uses the seeded Floor server-side', async () => {
    const floorSeed = {
      values: { dignityFloorPaise: 2000, settlementFloorPaise: 10000, womenDignityFloorPaise: 3000, overridesByMember: {} },
      author: 'founder',
      note: 'v1',
    };
    server = await composeWalletApp(baseConfig({ floorSeed }), { sessions: sessions(), now: () => T0 });
    const res = await server.inject({
      method: 'POST',
      url: '/v1/wage/settlements',
      headers: { ...bearer, 'content-type': 'application/json' },
      payload: {
        wage: { minor: 100000, currency: 'INR' },
        claims: { rent: { minor: 0, currency: 'INR' }, curry: { minor: 0, currency: 'INR' }, remittance: { minor: 0, currency: 'INR' }, savings: { minor: 0, currency: 'INR' }, membership_fee: { minor: 0, currency: 'INR' }, advance_repayment: { minor: 0, currency: 'INR' } },
        cause: 'none',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().floor_breached).toBe(false);
    // take-home = floor (2000) + all surplus (98000), no claims.
    expect(res.json().take_home).toEqual({ minor: 100000, currency: 'INR' });
  });

  it('the rail surface denies without the configured service token, accepts with it', async () => {
    server = await composeWalletApp(baseConfig({ serviceTokens: ['rail-secret'] }), { sessions: sessions(), now: () => T0 });
    // No token → 401.
    expect((await server.inject({ method: 'POST', url: '/v1/rail/remittances/none/sent' })).statusCode).toBe(401);
    // Correct token, unknown remittance → 404 (auth passed).
    expect((await server.inject({ method: 'POST', url: '/v1/rail/remittances/none/sent', headers: svc('rail-secret') })).statusCode).toBe(404);
  });

  it('with no service token configured, the ops surface denies everything', async () => {
    server = await composeWalletApp(baseConfig(), { sessions: sessions(), now: () => T0 });
    // Empty secret set ⇒ even a presented token is rejected.
    expect((await server.inject({ method: 'POST', url: '/v1/ops/remittance-sla-sweep', headers: svc('anything') })).statusCode).toBe(401);
  });

  it('Member routes default-deny with an empty session store', async () => {
    server = await composeWalletApp(baseConfig(), { now: () => T0 }); // no sessions injected
    expect((await server.inject({ method: 'GET', url: '/v1/floor', headers: bearer })).statusCode).toBe(401);
  });
});
