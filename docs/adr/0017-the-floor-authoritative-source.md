# ADR-0017 — The Floor: authoritative enumeration source (OD-6)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (the Floor is Founder-owned; ruling 2026-07-04) · Engineering (mechanism) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-6 |
| **Brief** | [`/OD-6_FLOOR_BRIEF.md`](../../OD-6_FLOOR_BRIEF.md) |
| **Nia OS references** | Book I (Art. I) → Book V; Book IV §6.7 ("one Floor for everyone"); FD-11 (women Members) |

## Context
"The Floor" — the non-negotiable dignity guarantees every Member gets — is referenced across the system:
OD-1's dignity floor, off-boarding settlement floor, the woman-Member higher floors, the dignity gates.

## Problem
Where does the authoritative Floor live so it is one source, versioned, and enforceable — not re-stated
(and drifting) across services?

## Options considered
1. **A** — Hard-coded per service.
2. **B** — One versioned, Founder-owned server config, consumed via a shared library.
3. **C** — Encoded as database rows.

## Decision
**Option B.** A single **versioned `the_floor` configuration, Founder-owned**, consumed by every service
via a shared library and surfaced **read-only** to the app. Every change is **versioned and audited**.
Ruled early — OD-1/OD-4/OD-5 reference it.

## Reasoning
If each service carries its own copy, "one Floor for everyone" quietly becomes "one floor per service."
Option B makes the guarantee structural, with a single read/change point and full history. The Floor's
*contents* are meant to evolve (versioned); the *source and access mechanism* are the architectural,
hard-to-reverse part.

## Consequences
- `the_floor` versioned config (dignity minimums, settlement floors, the FD-11 higher floors) + a
  change-audit record.
- Read-only `GET /v1/floor` (versioned) for the app; an internal shared-lib accessor for services.
- A config/policy library used by **all** services; referenced by wage (ADR-0012), edge/sync (ADR-0015),
  savings (ADR-0016), membership off-boarding.
