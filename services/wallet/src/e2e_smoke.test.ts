/// End-to-end backend smoke (UAT). Drives the five money flows through the FULLY
/// COMPOSED wallet app — the same composeWalletApp production boots — over BOTH
/// durable backings: the file-backed reference AND the production Postgres code
/// path (via InMemorySqlExecutor, no database). If a flow passes here, it passes
/// over Postgres too: the domain composes over the DurableStore interface, and both
/// backings implement it. This is the readiness proof the online wiring exists for.
///
/// Server-side-only state (a savings account has no Member "deposit" endpoint) is
/// seeded through the SAME factory BEFORE composition, so the app's own stores load
/// it. No product value is invented — the Floor, tokens, and operator credential
/// are test fixtures passed as config, exactly as deploy reads them from files/env.

import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { FastifyInstance } from 'fastify';
import { InMemorySessionStore } from '@nia/runtime';
import { composeWalletApp } from './compose.js';
import type { WalletConfig } from './config.js';
import {
  FileDurableStoreFactory,
  PostgresDurableStoreFactory,
  type DurableStoreFactory,
} from './durable_factory.js';
import { InMemorySqlExecutor } from './postgres_store.js';
import { openAccount } from './savings.js';
import { DurableSavingsAccountStore } from './savings_ledger.js';
import { DurableGrantStore, DurableRafiqiActionStore } from './rafiqi_ledger.js';
import { autoTake, reverseWithCompensation, NoMoneyEffect } from './rafiqi_orchestrator.js';

const T0 = new Date('2026-07-04T09:00:00.000Z');
const SESSION = 'sess-ramesh';
const MEMBER = 'm-1';
const SERVICE_TOKEN = 'svc-secret-xyz';
const OPERATOR_CRED = 'op-cred-neha';
const bearer = { authorization: `Bearer ${SESSION}` };
const jsonBearer = { ...bearer, 'content-type': 'application/json' };
const svc = { 'x-nia-service-token': SERVICE_TOKEN };
const opTok = { 'x-nia-operator-token': OPERATOR_CRED, 'content-type': 'application/json' };

const FLOOR_SEED = {
  values: { dignityFloorPaise: 2000, settlementFloorPaise: 10000, womenDignityFloorPaise: 3000, overridesByMember: {} },
  author: 'founder',
  note: 'v1',
};

function config(dataDir: string): WalletConfig {
  return {
    host: '127.0.0.1',
    port: 0,
    store: 'file', // ignored — opts.stores is injected below
    databaseUrl: undefined,
    dataDir,
    serviceTokens: [SERVICE_TOKEN],
    recoveryCapBps: 0,
    savingsSettleMs: 0,
    floorSeed: FLOOR_SEED,
    operatorCredentials: { [OPERATOR_CRED]: 'op-neha' },
  };
}

function sessions() {
  return new InMemorySessionStore({ [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' } });
}

const cleanups: Array<() => void> = [];
let server: FastifyInstance | undefined;

afterEach(async () => {
  await server?.close();
  server = undefined;
  while (cleanups.length) cleanups.pop()!();
});

/// The two backings the whole service is proven over. `dataDir` is a scratch temp
/// dir for the file factory (and the config's file paths); the Postgres factory
/// ignores it and runs over one shared in-memory executor.
const backings: Array<{ name: string; factory: (dataDir: string) => DurableStoreFactory }> = [
  { name: 'file', factory: (dataDir) => new FileDurableStoreFactory(dataDir) },
  { name: 'postgres', factory: () => new PostgresDurableStoreFactory(new InMemorySqlExecutor()) },
];

describe.each(backings)('E2E backend smoke over the $name durable backing', ({ factory }) => {
  function freshDir(): string {
    const dir = mkdtempSync(join(tmpdir(), 'nia-e2e-'));
    cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
    return dir;
  }

  /// Seed server-side state (before compose) and build the fully-wired app over the
  /// backing. Returns the app plus the shared factory (for post-compose orchestration).
  async function boot(seed?: (f: DurableStoreFactory) => Promise<void>): Promise<{ app: FastifyInstance; stores: DurableStoreFactory }> {
    const dir = freshDir();
    const stores = factory(dir);
    if (seed) await seed(stores);
    const app = await composeWalletApp(config(dir), { sessions: sessions(), now: () => T0, stores });
    server = app;
    return { app, stores };
  }

  it('wage settlement — take-home respects the server-side Floor, never dips below it', async () => {
    const { app } = await boot();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/wage/settlements',
      headers: jsonBearer,
      payload: {
        wage: { minor: 100_000, currency: 'INR' },
        claims: {
          rent: { minor: 0, currency: 'INR' },
          curry: { minor: 0, currency: 'INR' },
          remittance: { minor: 0, currency: 'INR' },
          savings: { minor: 0, currency: 'INR' },
          membership_fee: { minor: 0, currency: 'INR' },
          advance_repayment: { minor: 0, currency: 'INR' },
        },
        cause: 'none',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().floor_breached).toBe(false);
    expect(res.json().take_home).toEqual({ minor: 100_000, currency: 'INR' });
  });

  it('remittance — Member initiates, the rail confirms + settles, the read is auditable', async () => {
    const { app } = await boot();
    const init = await app.inject({
      method: 'POST',
      url: '/v1/remittances',
      headers: jsonBearer,
      payload: { recipient_id: 'fam-anita', amount: { minor: 500_000, currency: 'INR' } },
    });
    expect(init.statusCode).toBe(201);
    const id = init.json().id as string;
    expect(init.json().state).toBe('initiated'); // "sent" is not "confirmed" (ADR-0013)

    // The rail (service-authed) drives the lifecycle to settled.
    const rail = (suffix: string) => app.inject({ method: 'POST', url: `/v1/rail/remittances/${id}/${suffix}`, headers: svc });
    expect((await rail('sent')).json().state).toBe('in_transit');
    expect((await rail('recipient-available')).json().state).toBe('confirmed_available');
    expect((await rail('settled')).json().state).toBe('settled');

    const read = await app.inject({ method: 'GET', url: `/v1/remittances/${id}`, headers: bearer });
    expect(read.json().state).toBe('settled');
    expect(read.json().history.map((e: { type: string }) => e.type)).toEqual(['initiated', 'sent', 'recipient_available', 'settled']);
  });

  it('savings withdrawal — instant to Wallet, T+n settle disclosed, account debited', async () => {
    const { app } = await boot(async (f) => {
      // Deposits arrive server-side (no Member deposit endpoint) — seed before compose.
      await new DurableSavingsAccountStore(f.open('savings-accounts')).save(
        openAccount({ id: `sav-${MEMBER}`, membershipId: MEMBER, now: T0, openingPrincipalPaise: 100_000, locked: false }),
      );
    });
    const res = await app.inject({
      method: 'POST',
      url: '/v1/savings/withdrawals',
      headers: jsonBearer,
      payload: { amount: { minor: 40_000, currency: 'INR' } },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().state).toBe('available'); // instant to Wallet
    expect(res.json().amount).toEqual({ minor: 40_000, currency: 'INR' }); // unpenalised
    const acct = await app.inject({ method: 'GET', url: '/v1/savings/account', headers: bearer });
    expect(acct.json().balance).toEqual({ minor: 60_000, currency: 'INR' }); // debited
  });

  it('RafiQi action + reversal — grant (HTTP) → auto-take (orchestrator) → reverse within 24h', async () => {
    const { app, stores } = await boot();
    // The Member grants standing authorisation through the composed HTTP surface.
    const grant = await app.inject({
      method: 'POST',
      url: '/v1/rafiqi/grants',
      headers: jsonBearer,
      payload: { action_type: 'store_swap', cap: { minor: 50_000, currency: 'INR' }, ttl_ms: 30 * 24 * 60 * 60 * 1000 },
    });
    expect(grant.statusCode).toBe(201);

    // RafiQi (the orchestrator) auto-takes under the grant, over the SAME backing.
    let n = 0;
    const deps = {
      grants: new DurableGrantStore(stores.open('grants')),
      actions: new DurableRafiqiActionStore(stores.open('rafiqi-actions')),
      effect: new NoMoneyEffect(),
      now: () => T0,
      newId: () => `act-${++n}`,
    };
    const taken = await autoTake({ membershipId: MEMBER, actionType: 'store_swap', amountPaise: 30_000 }, deps);
    expect(taken.outcome).toBe('taken');
    if (taken.outcome !== 'taken') return;
    expect(taken.action.state).toBe('reversible');

    // The action reverses inside the 24h window (compensation), persisted.
    const reversed = await reverseWithCompensation(taken.action.id, deps);
    expect(reversed.state).toBe('reversed');
    expect((await deps.actions.get(taken.action.id))?.state).toBe('reversed');
  });

  it('offline conflict + Operator resolution — diverged money write queues, Operator resolves', async () => {
    const { app } = await boot();
    const sync = (writes: unknown[]) => app.inject({ method: 'POST', url: '/v1/sync', headers: jsonBearer, payload: { writes } });
    const money = (updatedAt: string, base?: string) => ({
      record: { id: 'rec-1', record_class: 'money', updated_at: updatedAt, payload: {} },
      ...(base !== undefined ? { base_updated_at: base } : {}),
    });

    // First offline money write applies (no server record yet).
    expect((await sync([money('2026-07-04T11:00:00.000Z')])).json().results).toEqual([{ id: 'rec-1', outcome: 'applied' }]);
    // A diverged write (base ≠ server) is NOT auto-applied — it goes to the Operator.
    expect((await sync([money('2026-07-04T12:00:00.000Z', '2026-07-04T10:00:00.000Z')])).json().results).toEqual([
      { id: 'rec-1', outcome: 'conflict_operator' },
    ]);

    // The Operator queue (service-authed read) shows the pending conflict.
    const pending = await app.inject({ method: 'GET', url: '/v1/ops/reconciliation', headers: svc });
    expect(pending.statusCode).toBe(200);
    expect(pending.json().conflicts).toHaveLength(1);
    const conflictId = pending.json().conflicts[0].id as string;

    // The Operator (operator-authed) resolves it, recording who + why.
    const resolve = await app.inject({
      method: 'POST',
      url: `/v1/ops/reconciliation/${conflictId}/resolve`,
      headers: opTok,
      payload: { choice: 'keep_server', reason: 'stale offline write, confirmed with member' },
    });
    expect(resolve.statusCode).toBe(200);
    expect(resolve.json().status).toBe('resolved');
    expect(resolve.json().resolution).toMatchObject({ choice: 'keep_server', operator_id: 'op-neha' });
  });
});
