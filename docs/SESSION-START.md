# Session Start — cold-start protocol

This repository is the memory. A new AI session does **not** depend on any previous
conversation. Every session begins by reading, in this order:

1. **Nia OS** — the relevant books for the task (the twelve books; `CLAUDE.md §2`).
   Re-read each task's books at the start of that task — books may have been amended.
2. **Repository** — `README.md`, `docs/methodology.md` (the governing process), and the
   directory READMEs for the scope you will touch.
3. **ADRs** — `docs/adr/` in full. **Read these before proposing any alternative**
   (`methodology.md` → Architecture Decisions). The register is `DECISIONS.md`.
4. **Current Product Specification** — `docs/product/` (and its register). A feature is
   built from an **Engineering-Locked** specification, owned by Founder/Product. The
   contract chain is `Nia OS → Product Specification → Implementation Plan → Code`:
   **implementation derives from the spec, never directly from Nia OS.** If no locked spec
   exists, the work is not ready — ask; do not invent what to build, and do not infer
   behaviour from the books.
5. **Current Task** — the specific task to implement this session.

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
