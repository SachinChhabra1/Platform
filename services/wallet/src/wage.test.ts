import { describe, expect, it } from 'vitest';
import { allocateWage, DEDUCTION_ORDER, type WageClaims, type WageInput } from './wage.js';

// Rupee helper — the allocator works in integer paise.
const R = (rupees: number): number => rupees * 100;

const CLAIMS: WageClaims = {
  rent: R(30),
  curry: R(20),
  remittance: R(50),
  savings: R(15),
  membershipFee: R(10),
  advanceRepayment: R(25),
};
const CLAIMS_TOTAL = R(150);
const FLOOR = R(20);

function input(over: Partial<WageInput> = {}): WageInput {
  return { wagePaise: R(200), dignityFloorPaise: FLOOR, claims: CLAIMS, cause: 'none', ...over };
}

// Money must be conserved: everything the wage brings is either paid to a claim
// or kept by the Member. Waived fee is not paid and not kept — so it is excluded.
function conserved(a: ReturnType<typeof allocateWage>, wage: number): boolean {
  const paidSum = DEDUCTION_ORDER.reduce((s, k) => s + a.paid[k], 0);
  return a.takeHomePaise + paidSum === wage;
}

describe('allocateWage — ADR-0012 / OD-1 (locked)', () => {
  it('a full wage pays every claim and returns the surplus as take-home', () => {
    const a = allocateWage(input({ wagePaise: R(200) }));
    expect(a.shortfall).toBe(false);
    expect(a.floorBreached).toBe(false);
    for (const k of DEDUCTION_ORDER) expect(a.paid[k]).toBe(CLAIMS[k]);
    for (const k of DEDUCTION_ORDER) expect(a.arrears[k]).toBe(0);
    // floor (20) + surplus (200 - 150 claims - 20 floor = 30) = 50 take-home
    expect(a.takeHomePaise).toBe(R(50));
    expect(conserved(a, R(200))).toBe(true);
  });

  it('exactly floor + claims: take-home is the floor, nothing deferred', () => {
    const wage = FLOOR + CLAIMS_TOTAL;
    const a = allocateWage(input({ wagePaise: wage }));
    expect(a.shortfall).toBe(false);
    expect(a.takeHomePaise).toBe(FLOOR);
    expect(conserved(a, wage)).toBe(true);
  });

  it('on a shortfall Nia is cut first: fee and advance defer, family is protected', () => {
    // Enough for floor + rent + curry + remittance + savings, but not fee/advance.
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15); // = R(135)
    const a = allocateWage(input({ wagePaise: wage, cause: 'member_caused' }));
    expect(a.shortfall).toBe(true);
    expect(a.floorBreached).toBe(false);
    // Member/family claims fully honoured...
    expect(a.paid.rent).toBe(R(30));
    expect(a.paid.curry).toBe(R(20));
    expect(a.paid.remittance).toBe(R(50));
    expect(a.paid.savings).toBe(R(15));
    // ...Nia's own claims are what slip.
    expect(a.paid.membershipFee).toBe(0);
    expect(a.paid.advanceRepayment).toBe(0);
    expect(a.arrears.membershipFee).toBe(R(10));
    expect(a.arrears.advanceRepayment).toBe(R(25));
    expect(a.takeHomePaise).toBe(FLOOR);
    expect(conserved(a, wage)).toBe(true);
  });

  it('a wage one paise short of full cuts the advance first (Nia is last)', () => {
    const wage = FLOOR + CLAIMS_TOTAL - 1;
    const a = allocateWage(input({ wagePaise: wage, cause: 'member_caused' }));
    // Only the very last claim (advance) is short, by exactly one paise.
    expect(a.arrears.advanceRepayment).toBe(1);
    expect(a.paid.advanceRepayment).toBe(CLAIMS.advanceRepayment - 1);
    expect(a.arrears.membershipFee).toBe(0);
    expect(a.arrears.savings).toBe(0);
    expect(conserved(a, wage)).toBe(true);
  });

  it('deep shortfall: only floor + rent covered, everything below defers', () => {
    const wage = FLOOR + R(30); // floor + rent only
    const a = allocateWage(input({ wagePaise: wage, cause: 'member_caused' }));
    expect(a.paid.rent).toBe(R(30));
    expect(a.paid.curry).toBe(0);
    expect(a.arrears.curry).toBe(R(20));
    expect(a.arrears.remittance).toBe(R(50));
    expect(a.takeHomePaise).toBe(FLOOR);
    expect(conserved(a, wage)).toBe(true);
  });

  it('the dignity floor is never breached to pay a claim; a sub-floor wage escalates', () => {
    const wage = R(12); // less than the R(20) floor
    const a = allocateWage(input({ wagePaise: wage, cause: 'employer_caused' }));
    expect(a.floorBreached).toBe(true);
    expect(a.shortfall).toBe(true);
    // The Member keeps everything there was; no claim is paid ahead of the floor.
    expect(a.takeHomePaise).toBe(wage);
    for (const k of DEDUCTION_ORDER) expect(a.paid[k]).toBe(0);
    expect(conserved(a, wage)).toBe(true);
  });

  it('employer-caused shortfall WAIVES the membership fee (not carried)', () => {
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15); // fee + advance unmet
    const a = allocateWage(input({ wagePaise: wage, cause: 'employer_caused' }));
    expect(a.waivedMembershipFeePaise).toBe(R(10));
    expect(a.arrears.membershipFee).toBe(0); // waived, not carried
    // The advance still carries — only the fee is waived.
    expect(a.arrears.advanceRepayment).toBe(R(25));
  });

  it('member-caused shortfall CARRIES the membership fee (not waived)', () => {
    const wage = FLOOR + R(30) + R(20) + R(50) + R(15);
    const a = allocateWage(input({ wagePaise: wage, cause: 'member_caused' }));
    expect(a.waivedMembershipFeePaise).toBe(0);
    expect(a.arrears.membershipFee).toBe(R(10)); // carried forward
  });

  it('rejects non-integer or negative paise (money must be exact)', () => {
    expect(() => allocateWage(input({ wagePaise: 10.5 }))).toThrow(RangeError);
    expect(() => allocateWage(input({ wagePaise: -1 }))).toThrow(RangeError);
    expect(() => allocateWage(input({ dignityFloorPaise: -5 }))).toThrow(RangeError);
  });
});
