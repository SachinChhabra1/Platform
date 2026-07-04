/// PostgreSQL durable-store seam (ADR-0006). Implements the same `DurableStore<T>`
/// interface as `FileDurableStore`, so any bespoke store composed over the
/// interface gets Postgres persistence by swapping the backing — no domain change.
///
/// It adds NO database DEPENDENCY here (the offline sandbox cannot fetch the `pg`
/// driver). Instead it depends on a tiny `SqlExecutor` PORT shaped like
/// node-postgres' `query({text, values})`; the real `pg.Pool` satisfies it online
/// with one line (`{ query: (q) => pool.query(q.text, q.values as unknown[]) }`).
/// Each store is one key-value table `(id text pk, seq bigserial, value jsonb)`;
/// `pgKeyValueSchema(table)` is the migration DDL. `values()` is `ORDER BY seq`
/// so insertion order (which some ports rely on) is preserved.

import type { DurableStore } from './durable_store.js';

/** A parameterised SQL statement, node-postgres shaped. */
export interface SqlQuery {
  readonly text: string;
  readonly values?: readonly unknown[];
}

export interface SqlResult {
  readonly rows: ReadonlyArray<Record<string, unknown>>;
}

/** The one capability a Postgres driver must provide. `pg.Pool` satisfies it. */
export interface SqlExecutor {
  query(q: SqlQuery): Promise<SqlResult>;
}

const SAFE_TABLE = /^[a-z_][a-z0-9_]*$/;

/** The migration DDL for a key-value table backing one durable store. */
export function pgKeyValueSchema(table: string): string {
  assertTable(table);
  return `CREATE TABLE IF NOT EXISTS ${table} (id text PRIMARY KEY, seq bigserial, value jsonb NOT NULL);`;
}

function assertTable(table: string): void {
  // The table name cannot be a bound parameter, so it is validated, never interpolated freely.
  if (!SAFE_TABLE.test(table)) {
    throw new RangeError(`unsafe table name ${JSON.stringify(table)} — must match ${SAFE_TABLE}`);
  }
}

export class PostgresDurableStore<T> implements DurableStore<T> {
  readonly #sql: SqlExecutor;
  readonly #table: string;

  constructor(sql: SqlExecutor, table: string) {
    assertTable(table);
    this.#sql = sql;
    this.#table = table;
  }

  async get(id: string): Promise<T | undefined> {
    const res = await this.#sql.query({ text: `SELECT value FROM ${this.#table} WHERE id = $1`, values: [id] });
    const row = res.rows[0];
    return row === undefined ? undefined : (row.value as T);
  }

  async put(id: string, value: T): Promise<void> {
    await this.#sql.query({
      text: `INSERT INTO ${this.#table} (id, value) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value`,
      values: [id, value],
    });
  }

  async delete(id: string): Promise<void> {
    await this.#sql.query({ text: `DELETE FROM ${this.#table} WHERE id = $1`, values: [id] });
  }

  async values(): Promise<readonly T[]> {
    const res = await this.#sql.query({ text: `SELECT value FROM ${this.#table} ORDER BY seq` });
    return res.rows.map((r) => r.value as T);
  }
}
