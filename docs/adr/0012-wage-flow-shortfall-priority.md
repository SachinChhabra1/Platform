# ADR-0012 — Wage-flow deduction priority on shortfall (OD-1)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling, 2026-07-04) · Engineering (implementation) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-1 |
| **Brief** | [`/OD-1_WAGE_FLOW_BRIEF.md`](../../OD-1_WAGE_FLOW_BRIEF.md) |
| **Nia OS references** | Book IV §4.2; Book II §2.4, §4.2 (wage in full), Art. XII (the Member wins) |

## Context
When a wage lands short (employer underpays, hours cut, advance outstanding) it cannot satisfy every
claim on it — rent, curry, remittance, savings, membership fee, advance repayment. The order decides who
absorbs the gap. This is Member-impacting policy, not an engineering default.

## Problem
In what order are claims honoured when the wage runs out partway down, and how are deferred claims treated?

## Options considered
1. **A** — Nia-protective waterfall (fee + advance first; Member/family absorb the shortfall).
2. **B** — Member-&-family-first waterfall; Nia's fee/advance last.
3. **C** — Pro-rata haircut above a dignity floor.

## Decision
**Option B.** Fixed order: **dignity floor → rent → curry → remittance → savings → membership fee →
advance repayment (last)**. Deferred claims **carry forward as arrears**, **except the membership fee on
an employer-caused shortfall, which is waived, not carried**. The backend is un-paused.

## Reasoning
The product exists to invert the informal economy's wound — the worker garnished first. Option B makes
Nia garnish itself last: on a short month the fee and advance recovery slip, never the Member's roof,
food, or family. Consistent with "your wage in full — and if it is ever wrong, we fix it first" and "one
Floor for everyone" (Art. XII). The Member's own survival (rent/food) ranks above remittance because a
Member who loses the Nest or can't eat can't keep earning. Nia pursues the employer for the gap.

## Consequences
- The wage-posting endpoint implements the fixed waterfall with the dignity floor (per ADR-0017/OD-6) as
  a hard constraint.
- The ledger gains an `arrears` record type; membership-fee arrears are waived on employer-caused shortfalls.
- Effectively irreversible once Members rely on it — treat as permanent (see `ENGINEERING_LOCK.md`).
- Un-gates R3 Wage Flow → R4–R8.
