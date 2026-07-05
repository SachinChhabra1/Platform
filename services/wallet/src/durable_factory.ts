/// Durable-store FACTORY (infra) — selects the backing for the wallet's stores at
/// composition time. `compose.ts` opens each store by LOGICAL NAME through this
/// factory, so the same composition runs over file-backed persistence (the offline
/// reference) or PostgreSQL (production, ADR-0006) with no domain change — the
/// choice is one config value (`NIA_STORE`).
///
/// `WALLET_STORE_NAMES` is the SINGLE SOURCE OF TRUTH: compose opens exactly these
/// names and the Postgres migration creates exactly one table per name, so the
/// schema and the composition can never drift.

import { join } from 'node:path';
import { FileDurableStore, InMemoryDurableStore, type DurableStore } from './durable_store.js';
import { PostgresDurableStore, pgKeyValueSchema, type SqlExecutor } from './postgres_store.js';

/** Every durable store the wallet composes, by logical name. The one list the
 *  factory, `compose.ts`, and the Postgres migration all read from. */
export const WALLET_STORE_NAMES = [
  'sessions',
  'floor',
  'remittances',
  'escalations',
  'arrears',
  'waivers',
  'savings-accounts',
  'withdrawals',
  'sync',
  'reconciliation',
  'grants',
  'rafiqi-actions',
] as const;

export type WalletStoreName = (typeof WALLET_STORE_NAMES)[number];

/** Opens a durable store by logical name. The backing is chosen once, at compose. */
export interface DurableStoreFactory {
  open<T>(name: WalletStoreName): DurableStore<T>;
}

/// File-backed factory: one atomic JSON snapshot file per store under the data dir.
/// The offline reference persistence — genuinely durable, single-process.
export class FileDurableStoreFactory implements DurableStoreFactory {
  readonly #dataDir: string;

  constructor(dataDir: string) {
    this.#dataDir = dataDir;
  }

  open<T>(name: WalletStoreName): DurableStore<T> {
    return new FileDurableStore<T>(join(this.#dataDir, `${name}.json`));
  }
}

/// In-memory factory: no durability, for tests and parity checks.
export class InMemoryDurableStoreFactory implements DurableStoreFactory {
  open<T>(_name: WalletStoreName): DurableStore<T> {
    return new InMemoryDurableStore<T>();
  }
}

/** Map a logical store name to its Postgres table (hyphens → underscores, prefixed
 *  so the tables are namespaced and always match the `SqlExecutor` safe-name rule). */
export function storeTableName(name: WalletStoreName): string {
  return `wallet_${name.replace(/-/g, '_')}`;
}

/// Postgres-backed factory (ADR-0006): every store is one key-value table over the
/// shared `SqlExecutor`. The production durability / multi-writer path.
export class PostgresDurableStoreFactory implements DurableStoreFactory {
  readonly #sql: SqlExecutor;

  constructor(sql: SqlExecutor) {
    this.#sql = sql;
  }

  open<T>(name: WalletStoreName): DurableStore<T> {
    return new PostgresDurableStore<T>(this.#sql, storeTableName(name));
  }
}

/** The migration DDL (idempotent — `CREATE TABLE IF NOT EXISTS`) for every wallet
 *  store table. Derived from `WALLET_STORE_NAMES`, so it is exhaustive by construction. */
export function walletMigrationStatements(): readonly string[] {
  return WALLET_STORE_NAMES.map((name) => pgKeyValueSchema(storeTableName(name)));
}

/// Run the wallet's Postgres migrations over the executor. Idempotent (every
/// statement is `CREATE TABLE IF NOT EXISTS`), so it is safe to run on every boot.
/// Returns the table names ensured.
export async function runWalletMigrations(sql: SqlExecutor): Promise<readonly string[]> {
  for (const statement of walletMigrationStatements()) {
    await sql.query({ text: statement });
  }
  return WALLET_STORE_NAMES.map(storeTableName);
}
