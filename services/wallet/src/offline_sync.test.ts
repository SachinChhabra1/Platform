import { describe, expect, it } from 'vitest';
import {
  applyOfflineWrite,
  resolveConflict,
  InMemoryReconciliationQueue,
  InMemorySyncStore,
  reconcile,
  type OfflineWrite,
  type RecordClass,
  type SyncRecord,
} from './offline_sync.js';

const NOW = new Date('2026-07-04T12:00:00.000Z');

function rec(id: string, cls: RecordClass, updatedAt: string, payload: unknown = {}): SyncRecord {
  return { id, recordClass: cls, updatedAt, payload };
}
function write(record: SyncRecord, baseUpdatedAt?: string): OfflineWrite {
  return baseUpdatedAt !== undefined ? { record, baseUpdatedAt } : { record };
}

describe('reconcile — append_only → merge (ADR-0015)', () => {
  it('adds a new record; dedups an existing one by id (no overwrite)', () => {
    const r = rec('log-1', 'append_only', '2026-07-04T10:00:00.000Z');
    expect(reconcile(write(r), undefined)).toEqual({ outcome: 'merged', persist: r });
    // Already present → merged, but nothing re-persisted (dedup, immutable fact).
    expect(reconcile(write(r), rec('log-1', 'append_only', '2026-07-04T09:00:00.000Z'))).toEqual({ outcome: 'merged' });
  });
});

describe('reconcile — intent → last-write-wins (ADR-0015)', () => {
  const server = rec('pref-1', 'intent', '2026-07-04T10:00:00.000Z');

  it('a newer write wins (applied)', () => {
    const r = rec('pref-1', 'intent', '2026-07-04T11:00:00.000Z');
    expect(reconcile(write(r), server)).toEqual({ outcome: 'applied', persist: r });
  });

  it('an older write loses to the server (kept_server)', () => {
    const r = rec('pref-1', 'intent', '2026-07-04T09:00:00.000Z');
    expect(reconcile(write(r), server)).toEqual({ outcome: 'kept_server' });
  });

  it('with no server record, the write applies', () => {
    const r = rec('pref-2', 'intent', '2026-07-04T09:00:00.000Z');
    expect(reconcile(write(r), undefined)).toEqual({ outcome: 'applied', persist: r });
  });
});

describe('reconcile — money → server-authoritative-with-reconciliation (ADR-0015)', () => {
  it('applies when there is no server record yet', () => {
    const r = rec('m-1', 'money', '2026-07-04T11:00:00.000Z');
    expect(reconcile(write(r), undefined)).toEqual({ outcome: 'applied', persist: r });
  });

  it('applies when the server has NOT diverged from the client base', () => {
    const server = rec('m-1', 'money', '2026-07-04T10:00:00.000Z');
    const r = rec('m-1', 'money', '2026-07-04T11:00:00.000Z');
    expect(reconcile(write(r, '2026-07-04T10:00:00.000Z'), server)).toEqual({ outcome: 'applied', persist: r });
  });

  it('CONFLICTS to the Operator when the server has diverged (never overwritten)', () => {
    const server = rec('m-1', 'money', '2026-07-04T10:30:00.000Z'); // moved since base
    const r = rec('m-1', 'money', '2026-07-04T11:00:00.000Z');
    const result = reconcile(write(r, '2026-07-04T10:00:00.000Z'), server);
    expect(result.outcome).toBe('conflict_operator');
    expect(result.persist).toBeUndefined(); // server is NOT overwritten
  });

  it('CONFLICTS when a money write has no known base but a server record exists', () => {
    const server = rec('m-1', 'money', '2026-07-04T10:00:00.000Z');
    const r = rec('m-1', 'money', '2026-07-04T11:00:00.000Z');
    expect(reconcile(write(r), server).outcome).toBe('conflict_operator');
  });
});

describe('applyOfflineWrite — orchestration + audit', () => {
  it('persists an applied write and enqueues nothing', async () => {
    const store = new InMemorySyncStore();
    const operator = new InMemoryReconciliationQueue();
    const r = rec('pref-1', 'intent', '2026-07-04T11:00:00.000Z', { theme: 'dark' });

    expect(await applyOfflineWrite(write(r), NOW, { store, operator })).toBe('applied');
    expect((await store.get('pref-1'))?.payload).toEqual({ theme: 'dark' });
    expect(await operator.listForRecord('pref-1')).toEqual([]);
  });

  it('a diverged money write is queued to the Operator and the server is UNCHANGED', async () => {
    const serverRec = rec('m-1', 'money', '2026-07-04T10:30:00.000Z', { balance: 500 });
    const store = new InMemorySyncStore([serverRec]);
    const operator = new InMemoryReconciliationQueue();
    const proposal = rec('m-1', 'money', '2026-07-04T11:00:00.000Z', { balance: 999 });

    expect(await applyOfflineWrite(write(proposal, '2026-07-04T10:00:00.000Z'), NOW, { store, operator })).toBe('conflict_operator');
    // The server money record was never silently overwritten.
    expect((await store.get('m-1'))?.payload).toEqual({ balance: 500 });
    // The proposal is not lost — it is on the Operator's queue, keyed by record id.
    const queued = await operator.listForRecord('m-1');
    expect(queued).toHaveLength(1);
    expect(queued[0]).toMatchObject({
      recordId: 'm-1',
      recordClass: 'money',
      serverUpdatedAt: '2026-07-04T10:30:00.000Z',
      at: NOW.toISOString(),
      status: 'pending',
    });
    expect(queued[0]!.proposed.updatedAt).toBe('2026-07-04T11:00:00.000Z'); // full proposal retained
    expect(typeof queued[0]!.id).toBe('string');
  });
});

describe('resolveConflict — OD-8 / ADR-0019 (pure)', () => {
  const item = {
    id: 'cf-1',
    recordId: 'm-1',
    recordClass: 'money' as const,
    proposed: rec('m-1', 'money', 't3', { balance: 999 }),
    serverUpdatedAt: 't2',
    at: NOW.toISOString(),
    status: 'pending' as const,
  };
  const at = new Date('2026-07-05T00:00:00.000Z');

  it('accept_proposal persists the proposed payload as a fresh authoritative version', () => {
    const r = resolveConflict(item, { choice: 'accept_proposal', operatorId: 'op-1', reason: 'ok', now: at });
    expect(r.persist).toEqual({ id: 'm-1', recordClass: 'money', updatedAt: at.toISOString(), payload: { balance: 999 } });
    expect(r.item.status).toBe('resolved');
    expect(r.item.resolution).toMatchObject({ choice: 'accept_proposal', operatorId: 'op-1', persisted: true });
  });

  it('keep_server persists nothing', () => {
    const r = resolveConflict(item, { choice: 'keep_server', operatorId: 'op-1', reason: 'stale', now: at });
    expect(r.persist).toBeUndefined();
    expect(r.item.resolution?.persisted).toBe(false);
  });

  it('manual persists the corrected payload', () => {
    const r = resolveConflict(item, { choice: 'manual', operatorId: 'op-1', reason: 'fixed', now: at, manualPayload: { balance: 750 } });
    expect(r.persist?.payload).toEqual({ balance: 750 });
  });

  it('throws on manual with no payload, and on an already-resolved item', () => {
    expect(() => resolveConflict(item, { choice: 'manual', operatorId: 'op-1', reason: 'x', now: at })).toThrow();
    const resolved = { ...item, status: 'resolved' as const };
    expect(() => resolveConflict(resolved, { choice: 'keep_server', operatorId: 'op-1', reason: 'x', now: at })).toThrow(/already resolved/);
  });
});
