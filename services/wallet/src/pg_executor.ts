/// The real PostgreSQL `SqlExecutor` — the ONE module that binds to node-postgres.
/// It is written DEPENDENCY-FREE: `pg` is never statically imported (the offline
/// sandbox has no `pg` in node_modules), it is loaded by DYNAMIC import at connect
/// time and typed by a minimal structural `PgPool` interface. So this file compiles
/// and unit-tests with no `pg` present; online, `pg` is installed and
/// `connectPgSqlExecutor()` resolves a real pool with one line. This is the
/// "one-liner over pg.Pool" the ADR-0006 seam anticipated, kept honest about the
/// offline constraint.

import type { SqlExecutor, SqlQuery, SqlResult } from './postgres_store.js';

/** The slice of node-postgres' `Pool` this adapter needs (structural — no pg types). */
export interface PgPool {
  query(text: string, values?: readonly unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
  end(): Promise<void>;
}

export interface PgConnectOptions {
  /** libpq connection string; if omitted, node-postgres reads the PG* env vars itself. */
  readonly connectionString?: string | undefined;
}

/// Adapts a node-postgres `Pool` (or any structural `PgPool`) to the `SqlExecutor`
/// port. Pure and fully unit-testable with a fake pool — no live database is needed
/// to prove the parameter/row mapping.
export class PgSqlExecutor implements SqlExecutor {
  readonly #pool: PgPool;

  constructor(pool: PgPool) {
    this.#pool = pool;
  }

  async query(q: SqlQuery): Promise<SqlResult> {
    const res = await this.#pool.query(q.text, q.values as readonly unknown[] | undefined);
    return { rows: res.rows };
  }

  /** Close the underlying pool (call once on shutdown). */
  async end(): Promise<void> {
    await this.#pool.end();
  }
}

/// Connect a `PgSqlExecutor` backed by a real node-postgres pool. `pg` is loaded via
/// dynamic import through a NON-LITERAL specifier so this module carries no static
/// dependency on it (offline builds resolve nothing). Throws a clear, actionable
/// error if `pg` is not installed in the runtime.
export async function connectPgSqlExecutor(opts: PgConnectOptions = {}): Promise<PgSqlExecutor> {
  const specifier = 'pg';
  let pg: { Pool: new (config?: unknown) => PgPool };
  try {
    pg = (await import(specifier)) as unknown as { Pool: new (config?: unknown) => PgPool };
  } catch {
    throw new Error(
      "the 'pg' driver is not installed — run `pnpm add pg --filter @nia/wallet` in the deploy environment before using the Postgres store (NIA_STORE=postgres)",
    );
  }
  const pool = new pg.Pool(opts.connectionString ? { connectionString: opts.connectionString } : undefined);
  return new PgSqlExecutor(pool);
}
