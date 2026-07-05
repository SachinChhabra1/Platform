/// Build ↔ database alignment (pre-UI gate). Proves, over the PRODUCTION Postgres
/// code path with no live DB, that:
///   • migrations create exactly the tables the store factory opens (same names),
///   • one shared executor = one database: a SECOND composeWalletApp over the same
///     executor is a "restart against the same DB",
///   • durable state (sessions, money, RafiQi actions, resolved conflicts) SURVIVES
///     that restart.
/// A single InMemorySqlExecutor is the shared DB; PostgresDurableStore reads/writes
/// through it exactly as node-postgres would, so alignment proven here holds live.

import { describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { composeWalletApp } from './compose.js';
import type { WalletConfig } from './config.js';
import { InMemorySqlExecutor } from './postgres_store.js';
import {
  PostgresDurableStoreFactory,
  runWalletMigrations,
  walletMigrationStatements,
  storeTableName,
  WALLET_STORE_NAMES,
} from './durable_factory.js';
import { openAccount } from './savings.js';
import { DurableSavingsAccountStore } from './savings_ledger.js';
import { DurableGrantStore, DurableRafiqiActionStore } from './rafiqi_ledger.js';
import { autoTake, reverseWithCompensation, NoMoneyEffect } from './rafiqi_orchestrator.js';

const T0 = new Date('2026-07-05T09:00:00.000Z');
const PHONE = '+919000000042';
const MEMBER = 'm-1';
const SVC = 'svc-secret';
const OP_CRED = 'op-cred';

function config(): WalletConfig {
  return {
    host: '127.0.0.1',
    port: 0,
    store: 'postgres', // ignored — the postgres factory is injected below
    databaseUrl: undefined,
    dataDir: 'unused-when-postgres',
    serviceTokens: [SVC],
    recoveryCapBps: 0,
    savingsSettleMs: 0,
    floorSeed: {
      values: { dignityFloorPaise: 250000, settlementFloorPaise: 1500000, womenDignityFloorPaise: 300000, overridesByMember: {} },
      author: 'test',
      note: 'v1',
    },
    operatorCredentials: { [OP_CRED]: 'op-neha' },
    memberDirectory: { [PHONE]: MEMBER },
  };
}

// A single executor is the shared database across "restarts".
function boot(sql: InMemorySqlExecutor): Promise<FastifyInstance> {
  return composeWalletApp(config(), { now: () => T0, stores: new PostgresDurableStoreFactory(sql) });
}

describe('build ↔ DB alignment — migrations match the store factory (items 4, 5)', () => {
  it('emits exactly one CREATE TABLE per WALLET_STORE_NAME, matching storeTableName', () => {
    const statements = walletMigrationStatements();
    expect(statements).toHaveLength(WALLET_STORE_NAMES.length);
    for (const name of WALLET_STORE_NAMES) {
      expect(statements.some((s) => s.includes(`CREATE TABLE IF NOT EXISTS ${storeTableName(name)} `))).toBe(true);
    }
  });

  it('every table the factory opens is one the migration created (no drift between them)', async () => {
    const sql = new InMemorySqlExecutor();
    const migrated = await runWalletMigrations(sql);
    const factory = new PostgresDurableStoreFactory(sql);
    for (const name of WALLET_STORE_NAMES) {
      // Opening + writing through the factory hits the same table the migration made.
      await factory.open<{ ok: boolean }>(name).put('probe', { ok: true });
      expect(migrated).toContain(storeTableName(name));
    }
  });
});

describe('DB-alignment smoke — migrate → run all flows → restart → state survives (item 10)', () => {
  it('durable state persists across a restart against the same database', async () => {
    const sql = new InMemorySqlExecutor();

    // --- migrate ------------------------------------------------------------
    await runWalletMigrations(sql);

    // Seed a savings account server-side (no Member deposit endpoint) BEFORE boot.
    await new DurableSavingsAccountStore(new PostgresDurableStoreFactory(sql).open('savings-accounts')).save(
      openAccount({ id: `sav-${MEMBER}`, membershipId: MEMBER, now: T0, openingPrincipalPaise: 100000, locked: false }),
    );

    // --- start backend (instance #1) ---------------------------------------
    const app1 = await boot(sql);
    const svc = { 'x-nia-service-token': SVC };

    // issue session (login) — the token must survive the restart.
    const login = await app1.inject({
      method: 'POST',
      url: '/v1/sessions',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'k1' },
      payload: { phone: PHONE, device_id: 'dev-1' },
    });
    expect(login.statusCode).toBe(201);
    const token = login.json().token as string;
    const auth = { authorization: `Bearer ${token}` };
    const jsonAuth = { ...auth, 'content-type': 'application/json' };

    // wage settlement
    const wage = await app1.inject({
      method: 'POST',
      url: '/v1/wage/settlements',
      headers: jsonAuth,
      payload: {
        wage: { minor: 100000, currency: 'INR' },
        claims: {
          rent: { minor: 0, currency: 'INR' }, curry: { minor: 0, currency: 'INR' },
          remittance: { minor: 0, currency: 'INR' }, savings: { minor: 0, currency: 'INR' },
          membership_fee: { minor: 0, currency: 'INR' }, advance_repayment: { minor: 0, currency: 'INR' },
        },
        cause: 'none',
      },
    });
    expect(wage.statusCode).toBe(200);

    // remittance: initiate → rail settle
    const rem = await app1.inject({ method: 'POST', url: '/v1/remittances', headers: jsonAuth, payload: { recipient_id: 'fam', amount: { minor: 500000, currency: 'INR' } } });
    const remId = rem.json().id as string;
    for (const step of ['sent', 'recipient-available', 'settled']) {
      expect((await app1.inject({ method: 'POST', url: `/v1/rail/remittances/${remId}/${step}`, headers: svc })).statusCode).toBe(200);
    }

    // savings withdrawal
    const wd = await app1.inject({ method: 'POST', url: '/v1/savings/withdrawals', headers: jsonAuth, payload: { amount: { minor: 40000, currency: 'INR' } } });
    expect(wd.statusCode).toBe(201);

    // RafiQi action + reversal (grant via HTTP, orchestrator takes + reverses over the same DB)
    expect((await app1.inject({ method: 'POST', url: '/v1/rafiqi/grants', headers: jsonAuth, payload: { action_type: 'store_swap', cap: { minor: 50000, currency: 'INR' }, ttl_ms: 2592000000 } })).statusCode).toBe(201);
    const factory = new PostgresDurableStoreFactory(sql);
    let n = 0;
    const deps = {
      grants: new DurableGrantStore(factory.open('grants')),
      actions: new DurableRafiqiActionStore(factory.open('rafiqi-actions')),
      effect: new NoMoneyEffect(),
      now: () => T0,
      newId: () => `act-${++n}`,
    };
    const taken = await autoTake({ membershipId: MEMBER, actionType: 'store_swap', amountPaise: 30000 }, deps);
    expect(taken.outcome).toBe('taken');
    if (taken.outcome !== 'taken') return;
    await reverseWithCompensation(taken.action.id, deps);
    const actionId = taken.action.id;

    // offline conflict + Operator resolution
    const money = (updatedAt: string, base?: string) => ({ record: { id: 'rec-1', record_class: 'money', updated_at: updatedAt, payload: {} }, ...(base !== undefined ? { base_updated_at: base } : {}) });
    await app1.inject({ method: 'POST', url: '/v1/sync', headers: jsonAuth, payload: { writes: [money('2026-07-05T11:00:00.000Z')] } });
    await app1.inject({ method: 'POST', url: '/v1/sync', headers: jsonAuth, payload: { writes: [money('2026-07-05T12:00:00.000Z', '2026-07-05T10:00:00.000Z')] } });
    const pending = await app1.inject({ method: 'GET', url: '/v1/ops/reconciliation', headers: svc });
    const conflictId = pending.json().conflicts[0].id as string;
    expect((await app1.inject({ method: 'POST', url: `/v1/ops/reconciliation/${conflictId}/resolve`, headers: { 'x-nia-operator-token': OP_CRED, 'content-type': 'application/json' }, payload: { choice: 'keep_server', reason: 'stale' } })).statusCode).toBe(200);

    // --- restart backend (instance #2, SAME database) -----------------------
    await app1.close();
    const app2 = await boot(sql);

    // session survives — the SAME token still authenticates a Member route.
    const list = await app2.inject({ method: 'GET', url: '/v1/remittances', headers: auth });
    expect(list.statusCode).toBe(200); // token durable (not 401)
    // remittance survives, still settled.
    expect((await app2.inject({ method: 'GET', url: `/v1/remittances/${remId}`, headers: auth })).json().state).toBe('settled');
    // savings debit survives.
    expect((await app2.inject({ method: 'GET', url: '/v1/savings/account', headers: auth })).json().balance).toEqual({ minor: 60000, currency: 'INR' });
    // Floor still served (seeded once; not re-seeded on restart).
    expect((await app2.inject({ method: 'GET', url: '/v1/floor', headers: auth })).statusCode).toBe(200);
    // RafiQi action still reversed (read via a fresh store over the same DB).
    const actions2 = new DurableRafiqiActionStore(new PostgresDurableStoreFactory(sql).open('rafiqi-actions'));
    expect((await actions2.get(actionId))?.state).toBe('reversed');
    // Conflict resolution survives — nothing pending on the Operator queue.
    expect((await app2.inject({ method: 'GET', url: '/v1/ops/reconciliation', headers: svc })).json().conflicts).toEqual([]);

    await app2.close();
  });
});
