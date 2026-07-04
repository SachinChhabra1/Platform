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

/// A dependency-free, in-memory `SqlExecutor` that implements EXACTLY the statements
/// `PostgresDurableStore` and the migration emit — `CREATE TABLE`, keyed `SELECT`,
/// ordered `SELECT ... ORDER BY seq`, upserting `INSERT ... ON CONFLICT`, and
/// `DELETE`. It lets the whole service run over the PRODUCTION Postgres code path
/// with no database — for tests, parity checks, and local/UAT demos. It is NOT a
/// general SQL engine and NOT for production (mirrors `InMemoryDurableStore`: a
/// parity backing behind the same seam). Insertion order is preserved via `seq`.
export class InMemorySqlExecutor implements SqlExecutor {
  readonly #tables = new Map<string, Map<string, { seq: number; value: unknown }>>();
  #seq = 0;

  #table(name: string): Map<string, { seq: number; value: unknown }> {
    let table = this.#tables.get(name);
    if (table === undefined) {
      table = new Map();
      this.#tables.set(name, table);
    }
    return table;
  }

  async query(q: SqlQuery): Promise<SqlResult> {
    const text = q.text.trim();
    const values = q.values ?? [];

    const create = /^CREATE TABLE IF NOT EXISTS (\w+)/i.exec(text);
    if (create) {
      this.#table(create[1] as string);
      return { rows: [] };
    }

    const del = /^DELETE FROM (\w+)\b/i.exec(text);
    if (del) {
      this.#table(del[1] as string).delete(values[0] as string);
      return { rows: [] };
    }

    const into = /^INSERT INTO (\w+)\b/i.exec(text);
    if (into) {
      const table = this.#table(into[1] as string);
      const [id, value] = values as [string, unknown];
      const existing = table.get(id);
      table.set(id, { seq: existing ? existing.seq : ++this.#seq, value }); // upsert keeps position
      return { rows: [] };
    }

    const from = /\bFROM (\w+)\b/i.exec(text);
    if (/^SELECT/i.test(text) && from) {
      const table = this.#table(from[1] as string);
      if (/WHERE id/i.test(text)) {
        const row = table.get(values[0] as string);
        return { rows: row ? [{ value: row.value }] : [] };
      }
      const ordered = [...table.values()].sort((a, b) => a.seq - b.seq);
      return { rows: ordered.map((r) => ({ value: r.value })) };
    }

    throw new Error(`InMemorySqlExecutor: unsupported statement: ${text}`);
  }
}
