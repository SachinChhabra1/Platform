import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { FastifyInstance } from 'fastify';
import { InMemorySessionStore } from '@nia/runtime';
import { bootstrapWalletApp } from './deploy.js';
import { composeWalletApp } from './compose.js';
import type { WalletConfig } from './config.js';
import { PostgresDurableStoreFactory } from './durable_factory.js';
import { InMemorySqlExecutor } from './postgres_store.js';

const T0 = new Date('2026-07-04T00:00:00.000Z');
const SESSION = 'sess-m1';
const bearer = { authorization: `Bearer ${SESSION}` };

let dir: string;
let server: FastifyInstance | undefined;
let dispose: (() => Promise<void>) | undefined;

const FLOOR_SEED = {
  values: { dignityFloorPaise: 2000, settlementFloorPaise: 10000, womenDignityFloorPaise: 3000, overridesByMember: {} },
  author: 'founder',
  note: 'v1',
};

function sessions() {
  return new InMemorySessionStore({ [SESSION]: { membershipId: 'm-1', deviceId: 'd-1' } });
}

function pgConfig(over: Partial<WalletConfig> = {}): WalletConfig {
  return {
    host: '127.0.0.1',
    port: 0,
    store: 'postgres',
    databaseUrl: undefined,
    dataDir: dir,
    serviceTokens: [],
    recoveryCapBps: 0,
    savingsSettleMs: 0,
    floorSeed: FLOOR_SEED,
    operatorCredentials: {},
    memberDirectory: {},
    ...over,
  };
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'nia-deploy-'));
});
afterEach(async () => {
  await server?.close();
  await dispose?.();
  server = dispose = undefined;
  rmSync(dir, { recursive: true, force: true });
});

describe('bootstrapWalletApp — env-only config → correctly-backed app', () => {
  it('NIA_STORE=file boots the file-backed app (env-only, no DB)', async () => {
    const boot = await bootstrapWalletApp({ NIA_DATA_DIR: dir }, { sessions: sessions(), now: () => T0 });
    server = boot.app;
    dispose = boot.dispose;
    expect(boot.config.store).toBe('file');
    // Unconfigured Floor ⇒ 404 (the app invents no floor).
    expect((await server.inject({ method: 'GET', url: '/v1/floor', headers: bearer })).statusCode).toBe(404);
  });

  it('NIA_STORE=postgres fails loudly offline (pg driver absent) — no silent fallback', async () => {
    // The offline sandbox has no `pg`; bootstrap must surface the exact blocker,
    // never quietly downgrade to files.
    await expect(bootstrapWalletApp({ NIA_STORE: 'postgres', NIA_DATA_DIR: dir })).rejects.toThrow(/pg' driver is not installed/);
  });

  it('an injected backing wins over config.store (tests can run the postgres path with no DB)', async () => {
    const boot = await bootstrapWalletApp(
      { NIA_STORE: 'postgres', NIA_DATA_DIR: dir },
      { sessions: sessions(), now: () => T0, stores: new PostgresDurableStoreFactory(new InMemorySqlExecutor()) },
    );
    server = boot.app;
    dispose = boot.dispose;
    // No throw, no pg needed — the app composed over the injected Postgres factory.
    expect((await server.inject({ method: 'GET', url: '/v1/floor', headers: bearer })).statusCode).toBe(404);
  });
});

describe('composeWalletApp over the Postgres code path (InMemorySqlExecutor)', () => {
  it('wires the whole app over PostgresDurableStore and serves the seeded Floor', async () => {
    server = await composeWalletApp(pgConfig(), {
      sessions: sessions(),
      now: () => T0,
      stores: new PostgresDurableStoreFactory(new InMemorySqlExecutor()),
    });
    const res = await server.inject({ method: 'GET', url: '/v1/floor', headers: bearer });
    expect(res.statusCode).toBe(200);
    expect(res.json().dignity_floor).toEqual({ minor: 2000, currency: 'INR' });
  });

  it('composeWalletApp with store=postgres and no injected backing refuses (points to bootstrap)', async () => {
    await expect(composeWalletApp(pgConfig(), { sessions: sessions(), now: () => T0 })).rejects.toThrow(/bootstrapWalletApp/);
  });
});
