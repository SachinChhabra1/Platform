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
/// SCOPE — recording only. How arrears are RECOVERED from a future wage (where
/// recovery sits in the next cycle's waterfall, and the order among multiple
/// arrears) is NOT defined by ADR-0012. That is an uncovered product decision
/// (OD-7, `FOUNDER_REVIEW.md`); recovery is deliberately NOT implemented here and
/// `status` is fixed at 'open' until it is ruled.

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
  /** Outstanding amount, integer paise, always > 0 (a zero arrear is not a record). */
  readonly amount: Money;
  /** ISO 'YYYY-MM-DD' the originating settlement occurred (server time). */
  readonly arisenOn: string;
  /**
   * Lifecycle. Only 'open' exists today — moving to 'recovered' is gated on the
   * arrears-recovery ruling (OD-7). Modelled as a literal so the type widens
   * cleanly when recovery is ruled.
   */
  readonly status: 'open';
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
}

/// In-memory seam for wiring and tests. Not the durable ledger — no idempotency,
/// no recovery, no audit persistence; those belong to the persistent-ledger slice
/// and OD-7. Arrears and waivers are held in separate stores (recorded distinctly).
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
}
