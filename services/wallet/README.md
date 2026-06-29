# services/wallet

**Purpose:** The event-sourced ledger. Every credit, debit, hold, release, reversal is
an immutable event; the balance is a projection. The most important system in Nia.
**No event is ever updated or deleted; a reversal is a new event** (Book VIII §2.9).
**Owner:** _unassigned (senior review required for every change — CLAUDE.md §9)._
**Nia OS books:** Book VIII (§2.8–2.9, §3.1 invariants), V (§2.9, §4.2 property tests).
**Local setup:** TypeScript (Node 20), pnpm workspace member (`@nia/wallet`).
**Testing:** Property tests over invariants; append-only enforced at the DB role level
(for the ledger). Vitest unit tests for the read-only Overview projection.

---

## This slice — Wallet Overview (read-only)

**Step 3** of the spec [`0001`](../../docs/product/0001-membership-strawman-spec.md) §14
sequence and the first Member-visible production slice (ADR-0008). It is a **pure read
model** that assembles the Member's economic life back to him (Article II; Book II §4.8;
spec §3 legibility). It moves **no money**, defines **no ledger engine**, and holds **no
policy** — no lending, credit, deductions policy, or settlement; no FD-10/FD-13.

`overviewForMonth` / `currentMonthOverview` project an assembled `WalletActivity` log into a
`MonthlyOverview`. The locked legibility requirements (§3) are honoured directly:

| Requirement (§3) | How this read model honours it |
|---|---|
| **Two distinct figures** | `availableBalance` (what he can use now — running spendable balance) is computed separately from `stayedThisMonth` (what remained his this month). They are never the same number. |
| **A bad month without shame** | A `MoneyStoryLine` carries only neutral structural data (`activityId`, `category`, `direction`, `amount`). There is **no** severity, alarm, or shame field. A deduction or informal-debt repayment is structurally identical to good news. |
| **History is reachable** | `availableMonths()` enumerates prior months; each is projectable. Deep per-transaction detail (screen 4.2) is a later slice. |
| **The Member's vocabulary only** | The read model emits structured data and open category codes; Member-facing wording and numerals are i18n/frontend (Book III §5.3). |

### Carried for Product confirmation

The spec mandates that "what stayed with you this month" be **distinct** from the available
balance, but does not fix its arithmetic. This slice defines it as the **net change in the
Member's total holdings** over the month, driven by each activity's `changesHoldings` flag
(savings stays with him; rent/food/remittance leave him). The flag is a property of the
**source data** (ultimately the ledger), so the read model invents no policy. The exact
interpretation should be confirmed at the next Wallet Overview Product Review.

### Money

Integer minor units (paise) only — never floats. Formatting (₹, the Member's script digits)
is i18n's job, not this layer's.

## Verify

```bash
pnpm --filter @nia/wallet test       # vitest
pnpm --filter @nia/wallet typecheck  # tsc --noEmit
```

Both also run under the repository-wide `pnpm run verify`.
