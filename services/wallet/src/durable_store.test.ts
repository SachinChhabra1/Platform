import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileDurableStore, InMemoryDurableStore } from './durable_store.js';
import { DurableRemittanceStore } from './remittance_ledger.js';
import { initiateRemittance, markSent, type Remittance } from './remittance.js';

const T0 = new Date('2026-07-04T00:00:00.000Z');

describe('InMemoryDurableStore', () => {
  it('put/get/delete/values in insertion order', async () => {
    const s = new InMemoryDurableStore<number>();
    await s.put('a', 1);
    await s.put('b', 2);
    expect(await s.get('a')).toBe(1);
    expect(await s.values()).toEqual([1, 2]);
    await s.delete('a');
    expect(await s.get('a')).toBeUndefined();
    expect(await s.values()).toEqual([2]);
  });
});

describe('FileDurableStore — durable across restart', () => {
  let dir: string;
  let path: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'nia-durable-'));
    path = join(dir, 'store.json');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('a fresh instance over the same file sees prior state', async () => {
    const first = new FileDurableStore<{ n: number }>(path);
    await first.put('x', { n: 42 });
    await first.put('y', { n: 7 });
    // Simulate a restart: a brand-new instance reads the persisted file.
    const reopened = new FileDurableStore<{ n: number }>(path);
    expect(await reopened.get('x')).toEqual({ n: 42 });
    expect(await reopened.values()).toEqual([{ n: 42 }, { n: 7 }]);
  });

  it('persists deletes', async () => {
    const s = new FileDurableStore<number>(path);
    await s.put('a', 1);
    await s.delete('a');
    expect(await new FileDurableStore<number>(path).get('a')).toBeUndefined();
  });

  it('a nested path is created on first write', async () => {
    const nested = join(dir, 'a', 'b', 'store.json');
    const s = new FileDurableStore<number>(nested);
    await s.put('k', 9);
    expect(await new FileDurableStore<number>(nested).get('k')).toBe(9);
  });
});

describe('DurableRemittanceStore — the port, made durable', () => {
  let dir: string;
  let path: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'nia-remit-'));
    path = join(dir, 'remittances.json');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  function remittance(id: string, member: string, sent = false): Remittance {
    const r = initiateRemittance({ id, membershipId: member, recipientId: 'fam', amount: { minor: 100000, currency: 'INR' }, now: T0 });
    return sent ? markSent(r, T0) : r;
  }

  it('satisfies the RemittanceStore port and survives restart', async () => {
    const store = new DurableRemittanceStore(new FileDurableStore<Remittance>(path));
    await store.save(remittance('r-1', 'm-1'));
    await store.save(remittance('r-2', 'm-1', true));
    await store.save(remittance('r-3', 'm-2'));

    // Restart: a new store over the same file.
    const reopened = new DurableRemittanceStore(new FileDurableStore<Remittance>(path));
    expect((await reopened.get('r-1'))?.id).toBe('r-1');
    expect((await reopened.listForMember('m-1')).map((r) => r.id).sort()).toEqual(['r-1', 'r-2']);
    // r-1 (initiated) and r-2 (in_transit) are unconfirmed; r-3 too.
    expect((await reopened.listUnconfirmed()).map((r) => r.id).sort()).toEqual(['r-1', 'r-2', 'r-3']);
  });

  it('defaults to an in-memory backing when none is given', async () => {
    const store = new DurableRemittanceStore();
    await store.save(remittance('r-1', 'm-1'));
    expect((await store.get('r-1'))?.id).toBe('r-1');
  });
});
