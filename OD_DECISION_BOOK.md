# The Founder Decision Book — OD-1…OD-6

**One sitting. Six rulings. The whole backend month unlocks.**

The frontend is signed off ([`R9_SIGNOFF.md`](R9_SIGNOFF.md)); the critical path is now product decisions,
not engineering effort. Backend code is expensive to change, so the product model is frozen **before**
it is built. Each OD below is a one-page brief: the decision, why it matters, viable options with
pros/cons, a recommendation, the cost of delaying, and the exact APIs / data model / services it touches.
Ruling an OD writes an ADR and un-gates its slice.

**The through-line for every recommendation** is the repo's own law — **"the Member wins" (Article XII)**
and **"one Floor for everyone" (Book IV §6.7)**. Where a choice trades Nia's convenience against the
Member's trust, the briefs recommend the Member. That is not softness; it is the moat.

## The book

| OD | Decision | Reversible? | Un-gates | Brief | Recommendation (one line) |
|----|----------|:--:|----------|-------|---------------------------|
| **OD-1** | Wage-flow deduction priority on shortfall | 🔴 No | R3 Wage Flow | [`OD-1_WAGE_FLOW_BRIEF.md`](OD-1_WAGE_FLOW_BRIEF.md) | **B** — Member-&-family-first waterfall; Nia's fee/advance last |
| **OD-2** | Remittance "destination-confirmed" + escalation SLA | 🟢 High | Remittance completion | [`OD-2_REMITTANCE_BRIEF.md`](OD-2_REMITTANCE_BRIEF.md) | **B** — confirmed = recipient-available; 24h SLA then Operator |
| **OD-3** | RafiQi reversibility window + standing-authorisation format | 🔴 Hard | RafiQi actions | [`OD-3_RAFIQI_BRIEF.md`](OD-3_RAFIQI_BRIEF.md) | **B** — 24h reversible; scoped, capped, revocable standing consent |
| **OD-4** | Offline conflict-resolution per record type | 🔴 Architectural | Offline write paths | [`OD-4_OFFLINE_BRIEF.md`](OD-4_OFFLINE_BRIEF.md) | **C** — per-type: money server-authoritative, intent last-write |
| **OD-5** | Savings withdrawal mechanics (settlement, interest) | 🟡 Partial | Savings Flow | [`OD-5_SAVINGS_BRIEF.md`](OD-5_SAVINGS_BRIEF.md) | **B** — instant-to-Wallet, T+ settle; interest accrues to Member |
| **OD-6** | The Floor — authoritative enumeration source | 🔴 Root | Dignity gates (cross-cutting) | [`OD-6_FLOOR_BRIEF.md`](OD-6_FLOOR_BRIEF.md) | **B** — one versioned server config, `the_floor`, Founder-owned |

🔴 expensive/irreversible once built — rule with most care · 🟡 moderate · 🟢 freely tunable later. Each
brief carries a **Decision profile** header (owner · reversible? · latest safe date · blocks). **Rule the
🔴 rows as if permanent.**

## Suggested reading order

Rule **OD-1 first** (critical path, gates R3 → R4–R8) and **OD-6 early** (the Floor is referenced by
OD-1's dignity floor and by the dignity gates, so pinning it removes ambiguity from the others). OD-2…OD-5
can then be ruled in any order in the same sitting.

## After the sitting

Each ruling becomes an ADR (OD-1 → ADR-0012, then sequential) **and is frozen into
[`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md)** — the contract implementation builds against. Once a
decision is **Locked** there, engineering treats it as immutable (no reinterpretation in code); it changes
only by a formal Founder revision, which supersedes the row and keeps the old one for audit. On the
rulings, Claude un-gates R2–R8 in [`ROADMAP.md`](ROADMAP.md) and builds against the existing
TypeScript/NestJS + PostgreSQL scaffold (`services/*`, ADR-0005/6/7) with very little remaining ambiguity.

The full governance flow:

```
1. Founder Decision Book (proposals)      ← this file + OD-1…OD-6 briefs
2. Founder rulings                         ← you pick an option per OD
3. Engineering Lock (frozen decisions)     ← ENGINEERING_LOCK.md
4. R2–R8 implementation                    ← realise the locked model, no improvisation
5. Verification against locked decisions   ← tests assert the locked behaviour
```

This is the clean hand-off from product discovery into execution:

> website live → frontend frozen except design evolution → **Founder decisions (this book)** →
> **engineering lock** → backend implementation (R3–R8) → native apps + production rollout (R2, R9 residual).

**References:** [`FOUNDER_REVIEW.md`](FOUNDER_REVIEW.md) (Q2), [`DECISIONS.md`](DECISIONS.md) (OD table,
ADRs), [`ROADMAP.md`](ROADMAP.md) (stream model).
