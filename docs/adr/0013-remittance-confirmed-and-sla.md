# ADR-0013 — Remittance "destination-confirmed" mechanism + escalation SLA (OD-2)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling, 2026-07-04) · Engineering (implementation) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-2 |
| **Brief** | [`/OD-2_REMITTANCE_BRIEF.md`](../../OD-2_REMITTANCE_BRIEF.md) |
| **Nia OS references** | Book I §4.9; Book IV §4.3; Book II Art. XII |

## Context
When a Member sends money home, "sent" must mean the family can actually get it, and a stalled transfer
must not sit silently. A false "sent" is the most trust-destroying event Nia can produce.

## Problem
What counts as confirmed delivery, and how long may a transfer stall before Nia escalates?

## Options considered
1. **A** — Rail-confirmed (rail reports settled).
2. **B** — Recipient-available confirmed + 24h SLA then Operator escalation.
3. **C** — Recipient-acknowledged (family actively confirms).

## Decision
**Option B.** "Confirmed" = funds are **available to the named recipient** (credited / ready for pickup),
shown to the Member as **"Reached home."** If not confirmed within **24h**, the record **auto-escalates to
the Operator**, who chases the rail and informs the Member. Family acknowledgement (C) is an **optional
extra** confidence signal, never the gate.

## Reasoning
"Settled to an account" ≠ "family received it"; Option B binds confirmation to recipient availability, the
thing that matters, with the Operator as the existing human backstop. The Member wins (Art. XII).

## Consequences
- `remittance` record states: `initiated → in_transit → confirmed_available → (escalated) → settled`, with
  an SLA timer (`escalate_after`).
- New `openapi.remittance.yaml`; NiaBook reads `confirmed_available` as "Reached home."
- SLA duration/wording are freely tunable post-launch (reversible) — the confirmation *definition* is the
  durable part.
