import { describe, expect, it } from 'vitest';
import { allocateWage, type WageClaims } from './wage.js';
import {
  arrearsFrom,
  waiverFrom,
  InMemoryArrearsLedger,
  type ArrearsCategory,
} from './arrears.js';

const R = (rupees: number): number => rupees * 100;

const CLAIMS: WageClaims = {
  rent: R(30),
  curry: R(20),
  remittance: R(50),
  savings: R(15),
  membershipFee: R(10),
  advanceRepayment: R(25),
};
const FLOOR = R(20);

const meta = (over: Partial<Parameters<typeof arrearsFrom>[1]> = {}) => ({
  membershipId: 'm-001',
  settlementId: 's-1',
  arisenOn: '2026-07-04',
  id: (c: ArrearsCategory) => `s-1:${c}`,
  ...over,
});

describe('arrearsFrom — ADR-0012 carry-forward derivation', () => {
  it('a fully-paid wage produces no arrears records', () => {
    const alloc = allocateWage({ wagePaise: R(200), dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'none' });
    expect(arrearsFrom(alloc, meta())).toEqual([]);
  });

  it('a shortfall records one open record per deferred claim, in deduction order', () => {
    // Covers floor + rent + curry + remittance + savings; fee + advance defer.
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15);
    const alloc = allocateWage({ wagePaise: wage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'member_caused' });
    const records = arrearsFrom(alloc, meta());
    expect(records.map((r) => r.category)).toEqual(['membershipFee', 'advanceRepayment']);
    expect(records.map((r) => r.amount.minor)).toEqual([R(10), R(25)]);
    for (const r of records) {
      expect(r.status).toBe('open');
      expect(r.membershipId).toBe('m-001');
      expect(r.settlementId).toBe('s-1');
      expect(r.arisenOn).toBe('2026-07-04');
      expect(r.amount.currency).toBe('INR');
    }
    expect(records.map((r) => r.id)).toEqual(['s-1:membershipFee', 's-1:advanceRepayment']);
  });

  it('the WAIVED membership fee is NOT carried as arrears (employer-caused)', () => {
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15);
    const alloc = allocateWage({ wagePaise: wage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'employer_caused' });
    const records = arrearsFrom(alloc, meta());
    // Only the advance carries; the fee was waived, so there is no fee record.
    expect(records.map((r) => r.category)).toEqual(['advanceRepayment']);
    expect(records.find((r) => r.category === 'membershipFee')).toBeUndefined();
  });

  it('reconciles to the allocation: every arrears record equals the reported arrears', () => {
    const wage = FLOOR + R(30) + R(20); // deep shortfall
    const alloc = allocateWage({ wagePaise: wage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'member_caused' });
    for (const r of arrearsFrom(alloc, meta())) {
      expect(r.amount.minor).toBe(alloc.arrears[r.category]);
    }
  });
});

describe('waiverFrom — ADR-0012 fee waiver (recorded distinctly)', () => {
  const shortWage = FLOOR + R(30) + R(20) + R(50) + R(15); // fee + advance unmet

  it('records one waiver of the fee on an employer-caused shortfall', () => {
    const alloc = allocateWage({ wagePaise: shortWage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'employer_caused' });
    const waivers = waiverFrom(alloc, { membershipId: 'm-001', settlementId: 's-1', arisenOn: '2026-07-04', id: 's-1:waiver' });
    expect(waivers).toHaveLength(1);
    expect(waivers[0]).toMatchObject({
      category: 'membershipFee',
      reason: 'employer_caused_shortfall',
      status: 'waived',
    });
    // Reconciles to the allocation's waived amount.
    expect(waivers[0]!.amount.minor).toBe(alloc.waivedMembershipFeePaise);
    expect(waivers[0]!.amount.minor).toBe(R(10));
  });

  it('records NO waiver on a member-caused shortfall (fee carries as arrears instead)', () => {
    const alloc = allocateWage({ wagePaise: shortWage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'member_caused' });
    expect(waiverFrom(alloc, { membershipId: 'm-001', settlementId: 's-1', arisenOn: '2026-07-04', id: 's-1:waiver' })).toEqual([]);
  });

  it('a waived fee is never both an arrears record AND a waiver (no double-count)', () => {
    const alloc = allocateWage({ wagePaise: shortWage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'employer_caused' });
    const arrears = arrearsFrom(alloc, meta());
    const waivers = waiverFrom(alloc, { membershipId: 'm-001', settlementId: 's-1', arisenOn: '2026-07-04', id: 's-1:waiver' });
    expect(arrears.some((r) => r.category === 'membershipFee')).toBe(false);
    expect(waivers.some((w) => w.category === 'membershipFee')).toBe(true);
  });

  it('a floor breach carries every unpaid claim forward', () => {
    const alloc = allocateWage({ wagePaise: R(12), dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'member_caused' });
    const records = arrearsFrom(alloc, meta());
    // Nothing was paid (floor unmet), so all six claims carry.
    expect(records.map((r) => r.category)).toEqual([
      'rent', 'curry', 'remittance', 'savings', 'membershipFee', 'advanceRepayment',
    ]);
  });
});

describe('InMemoryArrearsLedger', () => {
  it('records and lists a Member\'s open arrears; other Members are isolated', async () => {
    const ledger = new InMemoryArrearsLedger();
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15);
    const alloc = allocateWage({ wagePaise: wage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'member_caused' });

    await ledger.recordArrears(arrearsFrom(alloc, meta({ membershipId: 'm-001' })));
    await ledger.recordArrears(arrearsFrom(alloc, meta({ membershipId: 'm-002', settlementId: 's-2', id: (c) => `s-2:${c}` })));

    const mine = await ledger.listOpenArrears('m-001');
    expect(mine.map((r) => r.category)).toEqual(['membershipFee', 'advanceRepayment']);
    expect((await ledger.listOpenArrears('m-002')).every((r) => r.membershipId === 'm-002')).toBe(true);
    expect(await ledger.listOpenArrears('m-unknown')).toEqual([]);
  });

  it('records waivers distinctly from arrears (separate stores)', async () => {
    const ledger = new InMemoryArrearsLedger();
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15);
    const alloc = allocateWage({ wagePaise: wage, dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'employer_caused' });

    await ledger.recordArrears(arrearsFrom(alloc, meta({ membershipId: 'm-001' })));
    await ledger.recordWaivers(waiverFrom(alloc, { membershipId: 'm-001', settlementId: 's-1', arisenOn: '2026-07-04', id: 's-1:waiver' }));

    // The fee is a WAIVER, not an arrears; the advance is an arrears, not a waiver.
    expect((await ledger.listOpenArrears('m-001')).map((r) => r.category)).toEqual(['advanceRepayment']);
    expect((await ledger.listWaivers('m-001')).map((w) => w.category)).toEqual(['membershipFee']);
  });

  it('recording nothing is a no-op for both kinds', async () => {
    const ledger = new InMemoryArrearsLedger();
    await ledger.recordArrears([]);
    await ledger.recordWaivers([]);
    expect(await ledger.listOpenArrears('m-001')).toEqual([]);
    expect(await ledger.listWaivers('m-001')).toEqual([]);
  });
});
