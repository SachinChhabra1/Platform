# Session Start — cold-start protocol

This repository is the memory. A new AI session does **not** depend on any previous
conversation. **Understand the project first, then how you are expected to operate.** Read
the repository in this order:

1. **`docs/SESSION-START.md`** — this file (the cold-start protocol).
2. **`docs/PROJECT_STATUS.md`** — what is happening now: milestone, status, current blocker.
3. **`docs/adr/README.md`** — the architectural decisions already made. **Read these before
   proposing any alternative** (`methodology.md` → Architecture Decisions; register `DECISIONS.md`).
4. **`docs/product/README.md`** — the Product Specification register: what is being built.
5. **Current Product Specification** — the spec in flight (e.g.
   [`docs/product/0001-membership-strawman-spec.md`](product/0001-membership-strawman-spec.md)).
6. **`docs/engineering-stack.md`** — implementation choices (if relevant to the work).
7. **[`docs/CHARTER.md`](CHARTER.md)** — the Operating Charter: how the AI Engineer operates.
   It is authoritative and supersedes conversational instructions, but it **governs behaviour**,
   so it is read **after** you understand the project — not before.

When you take on a specific Product or spec task, re-read the **relevant Nia OS books** for that
task (`CLAUDE.md §2`; books may have been amended). The contract chain is
`Nia OS → Product Specification → Implementation Plan → Code`: **implementation derives from the
Engineering-Locked spec, never directly from the books.** If no locked spec exists, the work is
not ready — ask; do not invent what to build.

## Then follow the development cycle

- **Phase 2 — Plan (no code).** Identify dependencies, risks, and the smallest
  reviewable tasks. Produce an implementation plan and **wait for approval** before
  building.
- **Phase 3 — Build vertically.** One vertical slice (DB → API → Flutter → tests → docs
  → deployable), never horizontally. Each task is one small, tested, reversible PR that
  references the relevant Nia OS sections. No unrelated refactoring, no speculative work,
  no hidden changes.
- **Phase 4 — Review behaviour.** Does it behave correctly, follow Nia OS, improve the
  Member experience, and avoid drift?
- **Phase 5 — Merge.** Merge, update the repository, update docs/ADRs, close the task.

## Roles, in one line
Founder/Product decide **what** is built and **how the experience works**; the AI
Engineer decides **how to implement** — never what to build (`docs/methodology.md`).

## When you make a new significant decision
Write a new ADR in `docs/adr/` (Status · Owner · Date · Nia OS references · Context ·
Problem · Options · Decision · Reasoning · Consequences) **before** the code that
depends on it, and add it to the register in `DECISIONS.md`.

## Where we are
- **Session 1 — Architecture:** done (readiness plan).
- **Session 2 — Repository foundation:** done (PR #1; PR #2 added methodology + ADRs;
  PR #3 expanded ADRs to the ten-field format and added the product-spec home).
- **Session 3 — Membership:** **blocked, by design.** Awaiting the **Membership Product
  Specification** (`docs/product/`). No Membership implementation and no production code
  begin until that spec is approved and a Phase-2 plan is reviewed.

Session map: Architecture → Repository foundation → Membership → Wallet →
Wallet Overview → Onboarding → Savings → Remittance → Operator → RafiQi.
