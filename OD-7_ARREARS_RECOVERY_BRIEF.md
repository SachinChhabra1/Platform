# OD-7 · Arrears Recovery Ordering — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Opened during R3 implementation** (not part of the
OD-1…OD-6 batch, so no 2026-07-13 expiry). **A ruling becomes ADR-0018 and un-gates arrears recovery.**

## Decision profile

| Field | Value |
|---|---|
| Decision owner | **Founder** |
| Reversible? | **No (hard)** for the ordering — a Member budgets around the recovery cadence once they feel it, exactly like OD-1. The recovery *cap* is tunable. |
| Latest safe decision date | Before any Member reaches a **second** short settlement (recovery only bites when prior arrears already exist). Recording works today without it. |
| Blocks | **Arrears recovery** — the second half of R3 Wage Flow. Recording carry-forward arrears is done ([ADR-0012](docs/adr/0012-wage-flow-shortfall-priority.md), committed); clearing them is blocked here. |

## Why this is a new decision (not covered by OD-1)

ADR-0012 defines the single-cycle deduction waterfall and that deferred claims **carry forward as
arrears** (recorded now). It does **not** define what happens on the *next* wage: **where recovering
prior arrears sits in the waterfall, and in what order multiple arrears are recovered.** Per the Step-5
rule (`ENGINEERING_LOCK.md`), that is an uncovered product decision — so implementation **stopped and
opened this OD** rather than invent a recovery order in code.

It matters because it decides whether a recovering Member's wage catches up old obligations or meets
this month's needs. Too aggressive re-creates the debt trap the product exists to heal (the wage is
eaten by last month's shortfall); too lax and arrears compound forever. It also interacts with OD-1:
arrears can include **Nia's own** fee/advance, and recovering those ahead of the Member's current needs
would quietly re-invert OD-1's "Nia last."

## Options

**A — Recover arrears FIRST** (after the dignity floor, before current claims). *Pro:* fastest clearing.
*Con:* starves the current month — the exact trap OD-1 avoids. **Reject.**

**B — Current cycle first; recover arrears from surplus only, oldest-first, capped. ✅ RECOMMENDED.**
This month's rent/food/remittance/savings are honoured in full first (the OD-1 waterfall runs unchanged);
**only genuine surplus** then clears arrears, **oldest-first**, up to a **recovery cap** so it is gradual;
**Nia's own arrears (fee/advance) recover last**, preserving OD-1's "Nia last." *Pro:* never sacrifices
the current month to the past; arrears visibly shrink without re-trapping. *Con:* arrears clear slowly;
needs a cap parameter.

**C — Per-category interleave** (current rent → rent-arrears → current curry → curry-arrears → …, before
Nia's fee/advance). *Pro:* balances catch-up per need-type. *Con:* more complex; can still divert
savings/remittance to arrears within a category. Keep as the alternative.

## Recommendation

**Option B**, with three parameters to confirm: **oldest-first** recovery order; a **recovery cap**
(a % of surplus or a fixed ceiling — tunable later); and **Nia's own arrears (fee/advance) last**.

## Cost of delaying

Low near-term (arrears only recover on a Member's *second* short settlement), but it blocks completing
R3: today arrears accumulate as `open` with no path to clear, so a recovering Member sees no progress.
R4–R8 do not depend on it.

## APIs · data model · services affected

- **Allocator:** a second, optional **recovery pass** after the current-cycle waterfall, reading open
  arrears from the `ArrearsLedger`.
- **Data model:** `ArrearsRecord.status` widens `'open' → 'open' | 'recovered'`; partial-recovery
  handling (a record partly cleared); a recovery cap config.
- **Services:** `services/wallet` (`wage.ts`, `arrears.ts`, `wage_http.ts`); `settleWage` reads
  outstanding arrears before allocating.

## To rule it in one line

> **"OD-7 is Option B: current-cycle claims first; recover arrears from surplus only, oldest-first,
> capped at <X>; Nia's own arrears (fee/advance) recovered last."**

**References:** [`OD-1_WAGE_FLOW_BRIEF.md`](OD-1_WAGE_FLOW_BRIEF.md),
[ADR-0012](docs/adr/0012-wage-flow-shortfall-priority.md), `services/wallet/src/arrears.ts`,
[`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md).
