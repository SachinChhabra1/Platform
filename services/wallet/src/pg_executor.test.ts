import { describe, expect, it } from 'vitest';
import { PgSqlExecutor, connectPgSqlExecutor, type PgPool } from './pg_executor.js';

/// A fake node-postgres pool: records the (text, values) it is called with and
/// returns canned rows, so we prove the SqlExecutor → pool mapping without a DB.
class FakePgPool implements PgPool {
  readonly calls: Array<{ text: string; values?: readonly unknown[] | undefined }> = [];
  ended = false;
  #rows: Array<Record<string, unknown>>;

  constructor(rows: Array<Record<string, unknown>> = []) {
    this.#rows = rows;
  }

  async query(text: string, values?: readonly unknown[]): Promise<{ rows: Array<Record<string, unknown>> }> {
    this.calls.push({ text, values });
    return { rows: this.#rows };
  }

  async end(): Promise<void> {
    this.ended = true;
  }
}

describe('PgSqlExecutor — the real Postgres SqlExecutor (ADR-0006)', () => {
  it('maps {text, values} onto pool.query(text, values) and returns its rows', async () => {
    const pool = new FakePgPool([{ value: { n: 1 } }]);
    const exec = new PgSqlExecutor(pool);
    const res = await exec.query({ text: 'SELECT value FROM t WHERE id = $1', values: ['a'] });
    expect(res.rows).toEqual([{ value: { n: 1 } }]);
    expect(pool.calls).toEqual([{ text: 'SELECT value FROM t WHERE id = $1', values: ['a'] }]);
  });

  it('passes undefined values through unchanged (no-arg queries)', async () => {
    const pool = new FakePgPool();
    await new PgSqlExecutor(pool).query({ text: 'SELECT value FROM t ORDER BY seq' });
    expect(pool.calls[0]).toEqual({ text: 'SELECT value FROM t ORDER BY seq', values: undefined });
  });

  it('end() closes the underlying pool', async () => {
    const pool = new FakePgPool();
    await new PgSqlExecutor(pool).end();
    expect(pool.ended).toBe(true);
  });

  it('connectPgSqlExecutor throws a clear, actionable error when pg is not installed', async () => {
    // The offline sandbox has no `pg` in node_modules, so this exercises the real
    // guard: a missing driver must fail loudly with the install instruction.
    await expect(connectPgSqlExecutor()).rejects.toThrow(/pg' driver is not installed/);
  });
});
