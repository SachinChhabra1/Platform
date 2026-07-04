# ADR-0014 — RafiQi reversibility window + standing-authorisation format (OD-3)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling, 2026-07-04) · Engineering (implementation) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-3 |
| **Brief** | [`/OD-3_RAFIQI_BRIEF.md`](../../OD-3_RAFIQI_BRIEF.md) |
| **Nia OS references** | Book IX §5; Book VIII §3.8; ADR-0004 (RafiQi orchestrator); Art. XII |

## Context
RafiQi acts for the Member (smart swap, moving savings, taking an opportunity). Its value is removing
friction; its danger is acting past the Member's intent. "RafiQi finds; the Member decides."

## Problem
How long does a RafiQi-initiated money action stay reversible, and what is the format of a standing
authorisation that lets RafiQi act without asking each time?

## Options considered
1. **A** — Final on execution (no undo).
2. **B** — 24h reversibility + scoped, capped, revocable standing consent.
3. **C** — Per-action confirmation always (no standing auth).

## Decision
**Option B.** Every RafiQi-initiated money action carries a **24h undo** before it settles. A **standing
authorisation** is **explicit, scoped by action-type and a rupee cap, time-bounded (expires), and
revocable at any time** — every grant and use logged. Outside an active grant, fall back to **per-action
confirmation (C)**.

## Reasoning
Reversibility + scoped consent let RafiQi stay frictionless within the Member's stated limits while never
acting unbounded or unrecoverable. The consent model is a trust/compliance commitment (hard to reverse) —
the window length is tunable, the model is not.

## Consequences
- `authorization_grant` (scope, rupee cap, expiry, `revoked_at`, audit); action records with
  `reversible_until`; a reversal path.
- `openapi.rafiqi.yaml` (grant, revoke, list, initiate, reverse). `services/rafiqi` implements it.
- Applies to any flow RafiQi drives — savings (ADR-0016), store swaps, work opportunities.
