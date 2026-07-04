import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileDurableStore } from './durable_store.js';
import { openAccount, requestWithdrawal } from './savings.js';
import { paise } from './money.js';
import {
  DurableSavingsAccountStore,
  DurableWithdrawalStore,
} from './savings_ledger.js';
import { DurableGrantStore, DurableRafiqiActionStore } from './rafiqi_ledger.js';
import { grantAuthorization as grant, takeAction as take } from './rafiqi.js';
import { DurableSyncStore, DurableReconciliationQueue, resolveConflict, type ReconciliationItem, type SyncRecord } from './offline_sync.js';
import { DurableOperatorEscalations } from './remittance_ledger.js';
import { DurableArrearsLedger, planArrearsRecovery, type ArrearsRecord } from './arrears.js';
import { DurableFloorRegistry } from './the_floor_registry.js';
import { createInitialFloor, reviseFloor, type FloorValues } from './the_floor.js';

const R = (n: number): number => n * 100;
const T0 = new Date('2026-06-01T00:00:00.000Z');
const DAYS = (n: number): number => n * 24 * 60 * 60 * 1000;

describe('Durable savings stores', () => {
  it('account store: save/get/getForMember/listAll', async () => {
    const s = new DurableSavingsAccountStore();
    await s.save(openAccount({ id: 'a1', membershipId: 'm-1', now: T0, openingPrincipalPaise: R(100) }));
    await s.save(openAccount({ id: 'a2', membershipId: 'm-2', now: T0 }));
    expect((await s.get('a1'))?.membershipId).toBe('m-1');
    expect((await s.getForMember('m-2'))?.id).toBe('a2');
    expect((await s.listAll()).map((a) => a.id).sort()).toEqual(['a1', 'a2']);
  });

  it('withdrawal store: listForMember + listDueForSettlement', async () => {
    const s = new DurableWithdrawalStore();
    const acct = openAccount({ id: 'a1', membershipId: 'm-1', now: T0, openingPrincipalPaise: R(1000) });
    const { withdrawal } = requestWithdrawal(acct, { id: 'w1', amountPaise: R(100), now: T0, settleAfterMs: DAYS(2) });
    await s.save(withdrawal);
    expect((await s.listForMember('m-1')).map((w) => w.id)).toEqual(['w1']);
    expect(await s.listDueForSettlement(new Date(T0.getTime() + DAYS(1)))).toEqual([]);
    expect((await s.listDueForSettlement(new Date(T0.getTime() + DAYS(2)))).map((w) => w.id)).toEqual(['w1']);
  });
});

describe('Durable RafiQi stores', () => {
  it('grant store: active vs all', async () => {
    const s = new DurableGrantStore();
    const g = grant({ id: 'g1', membershipId: 'm-1', actionType: 'store_swap', capPaise: R(500), now: T0, ttlMs: DAYS(30) });
    await s.save(g);
    expect((await s.listForMember('m-1')).map((x) => x.id)).toEqual(['g1']);
    expect((await s.listActiveForMember('m-1', new Date(T0.getTime() + DAYS(1)))).length).toBe(1);
    expect((await s.listActiveForMember('m-1', new Date(T0.getTime() + DAYS(31)))).length).toBe(0);
  });

  it('action store: save/get/listForMember', async () => {
    const s = new DurableRafiqiActionStore();
    await s.save(take({ id: 'x1', membershipId: 'm-1', actionType: 'store_swap', amountPaise: R(100), now: T0, via: { kind: 'confirmed' } }));
    expect((await s.get('x1'))?.state).toBe('reversible');
    expect((await s.listForMember('m-1')).length).toBe(1);
  });
});

describe('Durable sync store + reconciliation queue', () => {
  it('sync store get/put', async () => {
    const s = new DurableSyncStore();
    await s.put({ id: 'r1', recordClass: 'money', updatedAt: 't1', payload: { a: 1 } });
    expect((await s.get('r1'))?.payload).toEqual({ a: 1 });
  });

  it('reconciliation queue: pending filter, resolve drops it', async () => {
    const q = new DurableReconciliationQueue();
    const item: ReconciliationItem = { id: 'c1', recordId: 'r1', recordClass: 'money', proposed: { id: 'r1', recordClass: 'money', updatedAt: 't3', payload: {} }, at: T0.toISOString(), status: 'pending' };
    await q.enqueue(item);
    expect((await q.listPending()).map((i) => i.id)).toEqual(['c1']);
    expect((await q.listForRecord('r1')).length).toBe(1);
    const { item: resolved } = resolveConflict(item, { choice: 'keep_server', operatorId: 'op-1', reason: 'x', now: T0 });
    await q.save(resolved);
    expect(await q.listPending()).toEqual([]);
    expect((await q.get('c1'))?.status).toBe('resolved');
  });
});

describe('Durable operator escalations', () => {
  it('records multiple escalations per remittance', async () => {
    const e = new DurableOperatorEscalations();
    await e.raise({ remittanceId: 'rem-1', membershipId: 'm-1', reason: 'sla_breached_unconfirmed', at: T0.toISOString() });
    await e.raise({ remittanceId: 'rem-1', membershipId: 'm-1', reason: 'sla_breached_unconfirmed', at: T0.toISOString() });
    expect((await e.listForRemittance('rem-1')).length).toBe(2);
    expect(await e.listForRemittance('rem-2')).toEqual([]);
  });
});

describe('Durable arrears ledger', () => {
  function rec(id: string): ArrearsRecord {
    return { id, membershipId: 'm-1', settlementId: 's', category: 'rent', amount: paise(R(100)), arisenOn: '2026-05-01', status: 'open' };
  }
  it('records, lists open, and applies recovery (full → drops from open)', async () => {
    const l = new DurableArrearsLedger();
    await l.recordArrears([rec('ar-1')]);
    await l.recordWaivers([{ id: 'w-1', membershipId: 'm-1', settlementId: 's', category: 'membershipFee', amount: paise(R(10)), reason: 'employer_caused_shortfall', arisenOn: '2026-05-01', status: 'waived' }]);
    expect((await l.listOpenArrears('m-1')).map((r) => r.id)).toEqual(['ar-1']);
    expect((await l.listWaivers('m-1')).length).toBe(1);
    const plan = planArrearsRecovery(await l.listOpenArrears('m-1'), R(1000), 5000);
    await l.applyRecovery('m-1', plan, { settlementId: 's2', recoveredOn: '2026-07-04' });
    expect(await l.listOpenArrears('m-1')).toEqual([]);
  });
});

describe('Durable floor registry', () => {
  function values(): FloorValues {
    return { dignityFloorPaise: R(20), settlementFloorPaise: R(100), womenDignityFloorPaise: R(30), overridesByMember: {} };
  }
  it('append-only monotonic publish; current/get/history', async () => {
    const reg = new DurableFloorRegistry();
    const v1 = createInitialFloor({ values: values(), author: 'f', note: 'v1', now: T0 });
    await reg.publish(v1);
    await expect(reg.publish(v1)).rejects.toThrow(/append-only/); // re-publish v1 rejected
    await reg.publish(reviseFloor(v1, { values: values(), author: 'f', note: 'v2', now: T0 }));
    expect((await reg.current())?.version).toBe(2);
    expect((await reg.get(1))?.note).toBe('v1');
    expect((await reg.history()).map((v) => v.version)).toEqual([1, 2]);
  });
});

describe('Durability across restart (file-backed)', () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'nia-adapters-'));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('a durable savings store survives a simulated restart', async () => {
    const path = join(dir, 'savings.json');
    const first = new DurableSavingsAccountStore(new FileDurableStore(path));
    await first.save(openAccount({ id: 'a1', membershipId: 'm-1', now: T0, openingPrincipalPaise: R(100) }));
    const reopened = new DurableSavingsAccountStore(new FileDurableStore(path));
    expect((await reopened.getForMember('m-1'))?.id).toBe('a1');
  });
});
