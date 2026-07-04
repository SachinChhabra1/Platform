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

/// The persistence seam for arrears (ports & adapters, like `WalletActivitySource`
/// and `FloorSource`). The real, append-only, senior-reviewed ledger plugs in
/// here later; this port defines only record + read of open arrears.
export interface ArrearsLedger {
  /** Persist carry-forward arrears from a settlement. Recording none is a no-op. */
  record(records: readonly ArrearsRecord[]): Promise<void>;
  /** The Member's outstanding (open) arrears, in the order they were recorded. */
  listOpenForMember(membershipId: string): Promise<readonly ArrearsRecord[]>;
}

/// In-memory seam for wiring and tests. Not the durable ledger — no idempotency,
/// no recovery, no audit; those belong to the persistent-ledger slice and OD-7.
export class InMemoryArrearsLedger implements ArrearsLedger {
  readonly #byMember = new Map<string, ArrearsRecord[]>();

  async record(records: readonly ArrearsRecord[]): Promise<void> {
    for (const rec of records) {
      const list = this.#byMember.get(rec.membershipId) ?? [];
      list.push(rec);
      this.#byMember.set(rec.membershipId, list);
    }
  }

  async listOpenForMember(membershipId: string): Promise<readonly ArrearsRecord[]> {
    return [...(this.#byMember.get(membershipId) ?? [])].filter((r) => r.status === 'open');
  }
}
