import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  WALLET_STORE_NAMES,
  FileDurableStoreFactory,
  InMemoryDurableStoreFactory,
  PostgresDurableStoreFactory,
  storeTableName,
  walletMigrationStatements,
  runWalletMigrations,
} from './durable_factory.js';
import { InMemorySqlExecutor, type SqlExecutor, type SqlQuery, type SqlResult } from './postgres_store.js';

/// A recording executor: captures every statement so we can assert the migration
/// runs the full set of DDL and nothing else.
class RecordingSqlExecutor implements SqlExecutor {
  readonly seen: SqlQuery[] = [];
  async query(q: SqlQuery): Promise<SqlResult> {
    this.seen.push(q);
    return { rows: [] };
  }
}

describe('DurableStoreFactory — one composition, swappable backing', () => {
  it('FileDurableStoreFactory persists per-store under the data dir (survives a fresh instance)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'nia-factory-'));
    try {
      const factory = new FileDurableStoreFactory(dir);
      await factory.open<{ n: number }>('remittances').put('r1', { n: 1 });
      // A brand-new factory over the same dir sees the prior write (durable).
      const reopened = new FileDurableStoreFactory(dir).open<{ n: number }>('remittances');
      expect(await reopened.get('r1')).toEqual({ n: 1 });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('InMemoryDurableStoreFactory round-trips without touching disk', async () => {
    const store = new InMemoryDurableStoreFactory().open<{ n: number }>('sync');
    await store.put('s1', { n: 7 });
    expect(await store.get('s1')).toEqual({ n: 7 });
  });

  it('PostgresDurableStoreFactory opens each store as its own table over the shared executor', async () => {
    const sql = new InMemorySqlExecutor();
    const factory = new PostgresDurableStoreFactory(sql);
    const remit = factory.open<{ n: number }>('remittances');
    const savings = factory.open<{ n: number }>('savings-accounts');
    await remit.put('r1', { n: 1 });
    await savings.put('a1', { n: 2 });
    // Distinct logical stores map to distinct tables — no cross-talk.
    expect(await remit.get('r1')).toEqual({ n: 1 });
    expect(await savings.get('r1')).toBeUndefined();
    expect(await savings.get('a1')).toEqual({ n: 2 });
  });

  it('storeTableName is safe (hyphens → underscores, namespaced)', () => {
    expect(storeTableName('savings-accounts')).toBe('wallet_savings_accounts');
    expect(storeTableName('rafiqi-actions')).toBe('wallet_rafiqi_actions');
    expect(storeTableName('floor')).toBe('wallet_floor');
  });
});

describe('wallet Postgres migrations — exhaustive by construction', () => {
  it('emits one valid CREATE TABLE per store name', () => {
    const statements = walletMigrationStatements();
    expect(statements).toHaveLength(WALLET_STORE_NAMES.length);
    for (const name of WALLET_STORE_NAMES) {
      const table = storeTableName(name);
      expect(statements.some((s) => s.includes(`CREATE TABLE IF NOT EXISTS ${table}`))).toBe(true);
    }
  });

  it('runWalletMigrations runs every statement and returns the ensured tables (idempotent)', async () => {
    const rec = new RecordingSqlExecutor();
    const tables = await runWalletMigrations(rec);
    expect(rec.seen).toHaveLength(WALLET_STORE_NAMES.length);
    expect(tables).toEqual(WALLET_STORE_NAMES.map(storeTableName));
    expect(rec.seen.every((q) => q.text.startsWith('CREATE TABLE IF NOT EXISTS'))).toBe(true);
  });

  it('after migration the Postgres path round-trips over the same executor', async () => {
    const sql = new InMemorySqlExecutor();
    await runWalletMigrations(sql);
    const store = new PostgresDurableStoreFactory(sql).open<{ ok: boolean }>('grants');
    await store.put('g1', { ok: true });
    expect(await store.values()).toEqual([{ ok: true }]);
  });
});
