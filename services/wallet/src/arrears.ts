/// Arrears — the carry-forward record type the ledger gains under ADR-0012 / OD-1
/// (locked in /ENGINEERING_LOCK.md).
///
/// When a wage lands short, the claims that could not be paid this cycle are
/// deferred. ADR-0012 says they **carry forward as arrears** — EXCEPT the
/// membership fee on an employer-caused shortfall, which is **waived** (forgiven,
/// never carried). This module models that durable record and its persistence
/// seam. It reuses the integer-paise money model (`money.ts`); it holds no policy
/// of its own — the amounts come straight from the locked allocator.
///
/// RECOVERY is now ruled (OD-7 / ADR-0018, Locked): the current-cycle waterfall
/// (ADR-0012) runs first and unchanged; only surplus ABOVE the dignity floor
/// recovers prior arrears, OLDEST-FIRST, capped, with Nia's own fee/advance LAST.
/// `planArrearsRecovery` (below) is the pure encoding of that order; the recovery
/// CAP is Founder-owned config passed in per call, never a constant baked in here.

import type { Money } from './money.js';
import { paise } from './money.js';
import { DEDUCTION_ORDER, type WageAllocation, type WageClaims } from './wage.js';

export type ArrearsCategory = keyof WageClaims;

export interface ArrearsRecord {
  readonly id: string;
  readonly membershipId: string;
  /** The settlement this arrears arose from (traceability). */
  readonly settlementId: string;
  readonly category: ArrearsCategory;
  /** Outstanding amount, integer paise. Reduced as it is recovered (0 only once fully recovered). */
  readonly amount: Money;
  /** ISO 'YYYY-MM-DD' the originating settlement occurred (server time). */
  readonly arisenOn: string;
  /**
   * Lifecycle (OD-7 / ADR-0018): 'open' until fully recovered, then 'recovered'.
   * A PARTIAL recovery reduces `amount` and keeps 'open' (it is still owed).
   */
  readonly status: 'open' | 'recovered';
  /** Set when the record was fully recovered — the settlement that cleared it (audit). */
  readonly recoveredInSettlementId?: string | undefined;
  /** ISO 'YYYY-MM-DD' the record was fully recovered (audit). */
  readonly recoveredOn?: string | undefined;
}

export interface ArrearsFromMeta {
  readonly membershipId: string;
  readonly settlementId: string;
  readonly arisenOn: string;
  /** Mints a stable id per category (injectable so ids are deterministic in tests). */
  readonly id: (category: ArrearsCategory) => string;
}

/// Derive the carry-forward arrears records from a settlement allocation
/// (ADR-0012). One record per claim category with arrears > 0, in the locked
/// deduction order. The WAIVED membership fee produces NO record — the allocator
/// already zeroed it out of `arrears` (it is reported separately as
/// `waivedMembershipFeePaise`), so "waived, not carried" falls out for free.
export function arrearsFrom(allocation: WageAllocation, meta: ArrearsFromMeta): ArrearsRecord[] {
  const out: ArrearsRecord[] = [];
  for (const category of DEDUCTION_ORDER) {
    const amount = allocation.arrears[category];
    if (amount > 0) {
      out.push({
        id: meta.id(category),
        membershipId: meta.membershipId,
        settlementId: meta.settlementId,
        category,
        amount: paise(amount),
        arisenOn: meta.arisenOn,
        status: 'open',
      });
    }
  }
  return out;
}

/// A membership fee Nia FORGAVE on an employer-caused shortfall (ADR-0012).
/// Recorded DISTINCTLY from arrears: a waiver is never owed and never recovered —
/// it is an audit entry that Nia absorbed the fee because the employer failed
/// ("if it is ever wrong, we fix it first"). Arrears say "the Member owes this
/// later"; a waiver says "no one owes this — Nia ate it, on the record."
export interface WaiverRecord {
  readonly id: string;
  readonly membershipId: string;
  readonly settlementId: string;
  /** Only the membership fee is waivable under ADR-0012. */
  readonly category: 'membershipFee';
  /** Waived amount, integer paise, always > 0. */
  readonly amount: Money;
  readonly reason: 'employer_caused_shortfall';
  readonly arisenOn: string;
  /** Terminal: a waiver is neither open nor recoverable. */
  readonly status: 'waived';
}

export interface WaiverFromMeta {
  readonly membershipId: string;
  readonly settlementId: string;
  readonly arisenOn: string;
  readonly id: string;
}

/// Derive the waiver record from a settlement allocation (ADR-0012). At most one
/// — the membership fee, and only when the allocator waived it (an employer-caused
/// shortfall). Distinct from `arrearsFrom`: the waived fee is NOT in `arrears`
/// (the allocator zeroed it there and reports it as `waivedMembershipFeePaise`),
/// so the two derivations never double-count the same rupee.
export function waiverFrom(allocation: WageAllocation, meta: WaiverFromMeta): WaiverRecord[] {
  if (allocation.waivedMembershipFeePaise <= 0) return [];
  return [
    {
      id: meta.id,
      membershipId: meta.membershipId,
      settlementId: meta.settlementId,
      category: 'membershipFee',
      amount: paise(allocation.waivedMembershipFeePaise),
      reason: 'employer_caused_shortfall',
      arisenOn: meta.arisenOn,
      status: 'waived',
    },
  ];
}

// --- Arrears recovery (OD-7 / ADR-0018) -----------------------------------

/// Nia's OWN arrears — recovered LAST, after every claim the Member owes to
/// others. Recovering these ahead of the Member's needs would re-invert OD-1's
/// "Nia last", so the recovery order pushes them to the back.
const NIA_OWED: ReadonlySet<ArrearsCategory> = new Set<ArrearsCategory>(['membershipFee', 'advanceRepayment']);

/** One arrears record touched by a recovery pass. */
export interface RecoveryLine {
  readonly id: string;
  readonly category: ArrearsCategory;
  /** Amount recovered from this record this cycle, integer paise (> 0). */
  readonly recoveredPaise: number;
  /** Amount still owed on this record after recovery (0 = fully recovered). */
  readonly remainingPaise: number;
}

export interface RecoveryPlan {
  readonly lines: readonly RecoveryLine[];
  readonly totalRecoveredPaise: number;
}

/// The ADR-0018 recovery ORDER: the Member's own arrears before Nia's own, and
/// within each group OLDEST-FIRST (by `arisenOn`), stable by recorded order.
function recoveryOrder(arrears: readonly ArrearsRecord[]): ArrearsRecord[] {
  return arrears
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const aNia = NIA_OWED.has(a.r.category) ? 1 : 0;
      const bNia = NIA_OWED.has(b.r.category) ? 1 : 0;
      if (aNia !== bNia) return aNia - bNia; // Member-owed (0) before Nia-owed (1)
      if (a.r.arisenOn !== b.r.arisenOn) return a.r.arisenOn < b.r.arisenOn ? -1 : 1; // oldest first
      return a.i - b.i; // stable tiebreak
    })
    .map((x) => x.r);
}

/// Plan how this cycle's surplus recovers prior arrears (pure — the ADR-0018
/// ruling encoded). `surplusPaise` is the cash ABOVE the dignity floor (the caller
/// computes it; the floor is never dipped into). `capBps` is the Founder-owned
/// recovery cap in basis points of surplus (5000 = 50%; 0 disables recovery) —
/// passed in, NEVER a constant here. Recovers only `open` records, in the ADR-0018
/// order, partial-recovery allowed, until the capped budget is exhausted.
export function planArrearsRecovery(
  arrears: readonly ArrearsRecord[],
  surplusPaise: number,
  capBps: number,
): RecoveryPlan {
  if (!Number.isInteger(surplusPaise) || surplusPaise < 0) {
    throw new RangeError(`surplusPaise must be a non-negative integer, got ${surplusPaise}`);
  }
  if (!Number.isInteger(capBps) || capBps < 0 || capBps > 10_000) {
    throw new RangeError(`capBps must be an integer in [0, 10000], got ${capBps}`);
  }
  let budget = Math.floor((surplusPaise * capBps) / 10_000);
  const lines: RecoveryLine[] = [];
  let total = 0;
  for (const rec of recoveryOrder(arrears)) {
    if (budget <= 0) break;
    if (rec.status !== 'open') continue;
    const owed = rec.amount.minor;
    const take = Math.min(budget, owed);
    if (take <= 0) continue;
    lines.push({ id: rec.id, category: rec.category, recoveredPaise: take, remainingPaise: owed - take });
    budget -= take;
    total += take;
  }
  return { lines, totalRecoveredPaise: total };
}

export interface RecoveryMeta {
  readonly settlementId: string;
  /** ISO 'YYYY-MM-DD' the recovery happened (server time). */
  readonly recoveredOn: string;
}

/// The persistence seam for settlement carry-forward outcomes (ports & adapters,
/// like `WalletActivitySource` and `FloorSource`). It RECORDS — it decides
/// nothing (policy stays in the allocator, ADR-0012). Two DISTINCT record kinds,
/// both from the same allocation and traceable to the same `settlementId`:
///   • arrears — a claim the Member still owes (carried forward, status 'open')
///   • waivers — a fee Nia forgave (status 'waived'; never owed, never recovered)
/// The real append-only, senior-reviewed ledger plugs in here later.
export interface ArrearsLedger {
  /** Persist carry-forward arrears from a settlement. Recording none is a no-op. */
  recordArrears(records: readonly ArrearsRecord[]): Promise<void>;
  /** Persist waivers from a settlement (recorded distinctly from arrears). */
  recordWaivers(records: readonly WaiverRecord[]): Promise<void>;
  /** The Member's outstanding (open) arrears, in the order they were recorded. */
  listOpenArrears(membershipId: string): Promise<readonly ArrearsRecord[]>;
  /** The Member's recorded waivers, in the order they were recorded. */
  listWaivers(membershipId: string): Promise<readonly WaiverRecord[]>;
  /**
   * Apply a recovery plan (OD-7 / ADR-0018): reduce each touched record's
   * outstanding amount; a fully-recovered record becomes 'recovered' (with audit
   * provenance), a partially-recovered one stays 'open' with the smaller amount.
   */
  applyRecovery(membershipId: string, plan: RecoveryPlan, meta: RecoveryMeta): Promise<void>;
}

/// In-memory seam for wiring and tests. Not the durable ledger — no idempotency,
/// no audit persistence; those belong to the persistent-ledger slice. Arrears and
/// waivers are held in separate stores (recorded distinctly); recovery mutates the
/// arrears store in place per ADR-0018.
export class InMemoryArrearsLedger implements ArrearsLedger {
  readonly #arrears = new Map<string, ArrearsRecord[]>();
  readonly #waivers = new Map<string, WaiverRecord[]>();

  async recordArrears(records: readonly ArrearsRecord[]): Promise<void> {
    for (const rec of records) {
      const list = this.#arrears.get(rec.membershipId) ?? [];
      list.push(rec);
      this.#arrears.set(rec.membershipId, list);
    }
  }

  async recordWaivers(records: readonly WaiverRecord[]): Promise<void> {
    for (const rec of records) {
      const list = this.#waivers.get(rec.membershipId) ?? [];
      list.push(rec);
      this.#waivers.set(rec.membershipId, list);
    }
  }

  async listOpenArrears(membershipId: string): Promise<readonly ArrearsRecord[]> {
    return [...(this.#arrears.get(membershipId) ?? [])].filter((r) => r.status === 'open');
  }

  async listWaivers(membershipId: string): Promise<readonly WaiverRecord[]> {
    return [...(this.#waivers.get(membershipId) ?? [])];
  }

  async applyRecovery(membershipId: string, plan: RecoveryPlan, meta: RecoveryMeta): Promise<void> {
    const list = this.#arrears.get(membershipId);
    if (!list) return;
    const byId = new Map(plan.lines.map((l) => [l.id, l]));
    this.#arrears.set(
      membershipId,
      list.map((rec) => {
        const line = byId.get(rec.id);
        if (!line || rec.status !== 'open') return rec;
        const fully = line.remainingPaise === 0;
        return {
          ...rec,
          amount: paise(line.remainingPaise),
          status: fully ? 'recovered' : 'open',
          ...(fully ? { recoveredInSettlementId: meta.settlementId, recoveredOn: meta.recoveredOn } : {}),
        };
      }),
    );
  }
}
