/// Wage-flow shortfall allocator — the pure heart of R3 (Wage Flow).
///
/// This is the literal encoding of the Founder's locked ruling ADR-0012 (OD-1),
/// frozen in `/ENGINEERING_LOCK.md`. It must not be reinterpreted: when a wage
/// lands short, claims are honoured in a fixed order that protects the Member and
/// their family and defers Nia's own claims LAST:
///
///   dignity floor → rent → curry → remittance → savings → membership fee → advance
///
/// Deferred claims carry forward as arrears, EXCEPT the membership fee on an
/// employer-caused shortfall, which is WAIVED (Nia does not dun the Member for the
/// employer's failure — "if it is ever wrong, we fix it first").
///
/// All amounts are integer paise (like `money.ts`) — never floats — so the
/// arithmetic is exact (Book V §1.8). Money is conserved: takeHome + Σpaid = wage.
/// The dignity floor value itself comes from the Floor (ADR-0017/OD-6); this
/// allocator takes it as input and never invents it.
///
/// NOTE (bounded context): this is Wage-Flow (R3) logic, co-located in the wallet
/// money domain because wage income settles into the wallet ledger and reuses its
/// integer-paise money model. It is self-contained and should be extracted to a
/// dedicated `services/wage` package once the workspace can be extended (the
/// offline dev sandbox cannot currently add a new pnpm workspace member).

/// The claims that compete for one wage, in no particular order (the ORDER
/// constant fixes priority). Each is an amount *due* this cycle, in paise.
export interface WageClaims {
  readonly rent: number;
  readonly curry: number;
  readonly remittance: number;
  readonly savings: number;
  readonly membershipFee: number;
  readonly advanceRepayment: number;
}

/// Why the wage is short — decides the membership-fee arrears treatment.
export type ShortfallCause = 'employer_caused' | 'member_caused' | 'none';

export interface WageInput {
  /** The wage actually received this cycle, in paise. */
  readonly wagePaise: number;
  /** The Member's protected minimum take-home cash, in paise (from the Floor). */
  readonly dignityFloorPaise: number;
  readonly claims: WageClaims;
  /** Cause of any shortfall; only 'employer_caused' waives the membership fee. */
  readonly cause: ShortfallCause;
}

export interface WageAllocation {
  /** Cash that reaches the Member: the protected floor plus any surplus after all claims. */
  readonly takeHomePaise: number;
  /** Amount honoured per claim this cycle. */
  readonly paid: WageClaims;
  /** Amount deferred per claim, carried forward as arrears. */
  readonly arrears: WageClaims;
  /** Membership fee that was waived (not carried) because the shortfall was employer-caused. */
  readonly waivedMembershipFeePaise: number;
  /** True when the wage could not even cover the dignity floor — must escalate to the Operator. */
  readonly floorBreached: boolean;
  /** True when any claim was not fully met (or the floor was breached). */
  readonly shortfall: boolean;
}

/// The fixed deduction priority. Nia's own claims (membershipFee, advance) are
/// LAST by design — do not reorder without a new Founder ruling that supersedes
/// ADR-0012.
export const DEDUCTION_ORDER = [
  'rent',
  'curry',
  'remittance',
  'savings',
  'membershipFee',
  'advanceRepayment',
] as const satisfies ReadonlyArray<keyof WageClaims>;

const ZERO_CLAIMS: WageClaims = {
  rent: 0,
  curry: 0,
  remittance: 0,
  savings: 0,
  membershipFee: 0,
  advanceRepayment: 0,
};

function assertPaise(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer paise value, got ${value}`);
  }
}

/// Allocate a (possibly short) wage across the Member's claims per ADR-0012.
export function allocateWage(input: WageInput): WageAllocation {
  const { wagePaise, dignityFloorPaise, claims, cause } = input;
  assertPaise('wagePaise', wagePaise);
  assertPaise('dignityFloorPaise', dignityFloorPaise);
  for (const key of DEDUCTION_ORDER) assertPaise(`claims.${key}`, claims[key]);

  let remaining = wagePaise;

  // 1. The Member's dignity floor is secured first — untouchable, even before rent.
  const floorReserved = Math.min(remaining, dignityFloorPaise);
  remaining -= floorReserved;
  const floorBreached = floorReserved < dignityFloorPaise;

  // 2. Pay each claim in the fixed order until the wage runs out.
  const paid: Record<keyof WageClaims, number> = { ...ZERO_CLAIMS };
  const arrears: Record<keyof WageClaims, number> = { ...ZERO_CLAIMS };
  for (const key of DEDUCTION_ORDER) {
    const due = claims[key];
    const pay = Math.min(remaining, due);
    paid[key] = pay;
    arrears[key] = due - pay;
    remaining -= pay;
  }

  // 3. Membership fee arrears are waived (not carried) on an employer-caused shortfall.
  let waivedMembershipFeePaise = 0;
  if (cause === 'employer_caused' && arrears.membershipFee > 0) {
    waivedMembershipFeePaise = arrears.membershipFee;
    arrears.membershipFee = 0;
  }

  // 4. Anything left after every claim returns to the Member as take-home.
  const takeHomePaise = floorReserved + remaining;

  const shortfall =
    floorBreached || DEDUCTION_ORDER.some((key) => arrears[key] > 0) || waivedMembershipFeePaise > 0;

  return {
    takeHomePaise,
    paid,
    arrears,
    waivedMembershipFeePaise,
    floorBreached,
    shortfall,
  };
}
