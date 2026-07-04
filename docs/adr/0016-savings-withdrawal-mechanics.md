# ADR-0016 — Savings withdrawal mechanics: settlement + interest (OD-5)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling, 2026-07-04) · Engineering (implementation) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-5 |
| **Brief** | [`/OD-5_SAVINGS_BRIEF.md`](../../OD-5_SAVINGS_BRIEF.md) |
| **Nia OS references** | Book IV §4.4; Art. XII (the Member wins) |

## Context
Savings is the Store flywheel's payoff — "Am I actually keeping more?" How fast a Member can get their
money back, and whether the yield is theirs, are trust signals a low-income Member reads instantly.

## Problem
On withdrawal, how fast does the Member get the money, and who earns the accrued interest?

## Options considered
1. **A** — Instant to Wallet, interest to Nia (float).
2. **B** — Instant availability, T+n settlement, interest to the Member.
3. **C** — Locked term with early-withdrawal penalty.

## Decision
**Option B.** On withdrawal the amount is **immediately available in the Wallet**; actual rail
**settlement is T+n** (disclosed); **interest accrues to the Member**, net of a single disclosed fee if
any. **No early-withdrawal penalty** on the default savings product.

## Reasoning
Their money, their yield, available on demand — the inversion of "the institution keeps the upside."
Matches the Satisfaction register. Settlement timing is tunable later; moving interest away from the
Member would be a felt takeaway, so that part is sticky.

## Consequences
- `savings_account` (principal, `accrued_interest`, lock state); `withdrawal` (`requested → available →
  settled`); an interest-accrual job.
- `openapi.savings.yaml`; writes the `savings` ledger category. Pairs with OD-1 (savings deduction, ADR-0012)
  and OD-3 (RafiQi-moved savings, ADR-0014).
