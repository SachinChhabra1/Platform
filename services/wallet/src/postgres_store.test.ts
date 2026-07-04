import { describe, expect, it } from 'vitest';
import { pgKeyValueSchema, PostgresDurableStore, type SqlExecutor, type SqlQuery, type SqlResult } from './postgres_store.js';

/// A functional fake of the one SQL capability: it recognises the four statements
/// the store emits (by keyword) and behaves like the real key-value table, so the
/// tests prove real store behaviour (round-trip, ordering) without a database, and
/// also capture the emitted SQL for assertions.
class FakeSqlExecutor implements SqlExecutor {
  readonly #rows = new Map<string, { seq: number; value: unknown }>();
  #seq = 0;
  readonly seen: SqlQuery[] = [];

  async query(q: SqlQuery): Promise<SqlResult> {
    this.seen.push(q);
    const text = q.text.trim();
    const values = q.values ?? [];
    if (text.startsWith('SELECT') && text.includes('WHERE id')) {
      const row = this.#rows.get(values[0] as string);
      return { rows: row ? [{ value: row.value }] : [] };
    }
    if (text.startsWith('SELECT')) {
      const ordered = [...this.#rows.values()].sort((a, b) => a.seq - b.seq);
      return { rows: ordered.map((r) => ({ value: r.value })) };
    }
    if (text.startsWith('INSERT')) {
      const [id, value] = values as [string, unknown];
      const existing = this.#rows.get(id);
      this.#rows.set(id, { seq: existing ? existing.seq : ++this.#seq, value }); // keep seq on upsert
      return { rows: [] };
    }
    if (text.startsWith('DELETE')) {
      this.#rows.delete(values[0] as string);
      return { rows: [] };
    }
    throw new Error(`unexpected SQL: ${text}`);
  }
}

describe('PostgresDurableStore — DurableStore over the SqlExecutor seam (ADR-0006)', () => {
  it('round-trips put/get/delete and preserves insertion order in values()', async () => {
    const sql = new FakeSqlExecutor();
    const store = new PostgresDurableStore<{ n: number }>(sql, 'remittances');
    await store.put('b', { n: 2 });
    await store.put('a', { n: 1 });
    expect(await store.get('a')).toEqual({ n: 1 });
    expect(await store.values()).toEqual([{ n: 2 }, { n: 1 }]); // insertion order (b before a)
    await store.put('b', { n: 20 }); // upsert keeps position
    expect(await store.values()).toEqual([{ n: 20 }, { n: 1 }]);
    await store.delete('b');
    expect(await store.get('b')).toBeUndefined();
    expect(await store.values()).toEqual([{ n: 1 }]);
  });

  it('emits parameterised SQL (no value interpolation) against the given table', async () => {
    const sql = new FakeSqlExecutor();
    const store = new PostgresDurableStore(sql, 'savings_accounts');
    await store.put('x', { a: 1 });
    await store.get('x');
    const insert = sql.seen.find((q) => q.text.startsWith('INSERT'));
    expect(insert?.text).toContain('savings_accounts');
    expect(insert?.text).toContain('ON CONFLICT (id) DO UPDATE');
    expect(insert?.values).toEqual(['x', { a: 1 }]);
    const select = sql.seen.find((q) => q.text.includes('WHERE id'));
    expect(select?.values).toEqual(['x']);
  });

  it('rejects an unsafe table name (it cannot be a bound parameter)', () => {
    const sql = new FakeSqlExecutor();
    expect(() => new PostgresDurableStore(sql, 'drop; table')).toThrow();
    expect(() => pgKeyValueSchema('bad-name')).toThrow();
  });

  it('produces a key-value migration DDL', () => {
    expect(pgKeyValueSchema('remittances')).toContain('CREATE TABLE IF NOT EXISTS remittances');
    expect(pgKeyValueSchema('remittances')).toContain('value jsonb NOT NULL');
  });
});
