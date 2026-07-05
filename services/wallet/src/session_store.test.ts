import { describe, expect, it } from 'vitest';
import { DurableSessionStore, type StoredSession } from './session_store.js';
import { InMemoryDurableStore } from './durable_store.js';

const member = (membershipId: string, deviceId = 'dev-1') => ({ membershipId, deviceId, scope: 'member' as const });

describe('DurableSessionStore — durable, sync-resolvable session boundary', () => {
  it('issues a token, resolves it, and revokes it', async () => {
    let n = 0;
    const store = await DurableSessionStore.load(new InMemoryDurableStore<StoredSession>(), { newToken: () => `t-${++n}` });
    const token = store.issue(member('m-1'));
    expect(token).toBe('t-1');
    expect(store.resolve('t-1')).toEqual(member('m-1'));
    store.revoke('t-1');
    expect(store.resolve('t-1')).toBeUndefined();
    store.revoke('unknown'); // idempotent no-op
  });

  it('issuing for a membership revokes its prior device (FD-S3, one active device)', async () => {
    let n = 0;
    const store = await DurableSessionStore.load(new InMemoryDurableStore<StoredSession>(), { newToken: () => `t-${++n}` });
    const first = store.issue(member('m-1', 'dev-A'));
    const second = store.issue(member('m-1', 'dev-B'));
    expect(store.resolve(first)).toBeUndefined(); // prior device cut off
    expect(store.resolve(second)).toEqual(member('m-1', 'dev-B'));
  });

  it('survives a restart — a fresh store over the same backing sees issued sessions', async () => {
    let n = 0;
    const backing = new InMemoryDurableStore<StoredSession>();
    const first = await DurableSessionStore.load(backing, { newToken: () => `t-${++n}` });
    const token = first.issue(member('m-1'));
    // A new process: hydrate from the same backing.
    const reloaded = await DurableSessionStore.load(backing);
    expect(reloaded.resolve(token)).toEqual(member('m-1'));
  });

  it('a revoke is durable too — not resurrected on reload', async () => {
    let n = 0;
    const backing = new InMemoryDurableStore<StoredSession>();
    const first = await DurableSessionStore.load(backing, { newToken: () => `t-${++n}` });
    const token = first.issue(member('m-1'));
    first.revoke(token);
    const reloaded = await DurableSessionStore.load(backing);
    expect(reloaded.resolve(token)).toBeUndefined();
  });
});
