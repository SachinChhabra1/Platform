# ADR-0018 — Arrears recovery ordering (OD-7)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling, 2026-07-04) · Engineering (implementation) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-7 |
| **Brief** | [`/OD-7_ARREARS_RECOVERY_BRIEF.md`](../../OD-7_ARREARS_RECOVERY_BRIEF.md) |
| **Nia OS references** | Book IV §6.7; Art. XII (the Member wins); ADR-0012 (OD-1) |

## Context
ADR-0012 (OD-1) defines the single-cycle deduction waterfall and that deferred claims **carry forward as
arrears** (recording is built and committed). It does **not** define what happens on the *next* wage:
where recovering prior arrears sits in the waterfall, and in what order multiple arrears are recovered.
Per the Step-5 rule, that uncovered decision stopped implementation and opened OD-7.

## Problem
On a later wage, how are prior arrears recovered without re-creating the debt trap the product exists to
heal — and without quietly re-inverting OD-1's "Nia last" by recovering Nia's own fee/advance ahead of the
Member's current needs?

## Options considered
1. **A** — Recover arrears FIRST (after the dignity floor, before current claims). Starves the current
   month; the exact trap OD-1 avoids. Rejected.
2. **B** — Current cycle first; recover arrears from surplus only, oldest-first, capped; Nia's own arrears
   last.
3. **C** — Per-category interleave (current rent → rent-arrears → current curry → …). More complex; can
   still divert savings/remittance to arrears within a category. Held as the alternative.

## Decision
**Option B.** The current-cycle waterfall (ADR-0012) runs **unchanged and first**. Only **genuine surplus
— cash above the dignity floor** — then recovers prior arrears, **oldest-first**, up to a **recovery cap**
so recovery is gradual, and **Nia's own arrears (membership fee, advance) recover last**, after all the
Member's own arrears. The cap is **Founder-owned configuration, not hard-coded product policy**; the ruled
value is **50% of surplus per cycle** (tunable later without a new ruling).

## Reasoning
This month's rent/food/remittance/savings are honoured in full before any past debt is touched, so the
wage is never eaten by last month's shortfall. Recovering only from surplus above the protected floor, and
capping it, makes arrears visibly shrink without re-trapping the Member. Recovering Nia's own arrears last
preserves OD-1's "Nia last." The ordering is the hard-to-reverse part (a Member budgets around the
recovery cadence); the cap is a tunable knob.

## Consequences
- **Allocator/orchestration:** a second, optional **recovery pass** after the current-cycle waterfall,
  reading open arrears from the `ArrearsLedger` and consuming only surplus above the floor, capped.
- **Data model:** `ArrearsRecord.status` widens `'open' → 'open' | 'recovered'`; partial recovery reduces
  a record's outstanding amount (stays `open`); full recovery marks it `recovered` (with provenance). A
  recovery-cap config value (Founder-owned).
- **Services:** `services/wallet` (`arrears.ts` recovery domain; `wage_http.ts` settlement orchestration).
  `settleWage` reads outstanding arrears and recovers from surplus before recording the new cycle's
  arrears. The cap is injected config — never a constant baked into the algorithm.
- Pairs with OD-1 (ADR-0012). The dignity floor (ADR-0017/OD-6) remains untouchable — recovery never dips
  below it.
