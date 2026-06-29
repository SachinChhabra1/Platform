# Session Start — cold-start protocol

This repository is the memory. A new AI session does **not** depend on any previous
conversation. Start here, every time.

## 1. Read the source of truth
- Read the relevant Nia OS books for the task (the twelve books; `CLAUDE.md §2`).
- Re-read each task's books at the start of that task — books may have been amended.

## 2. Read the repository (its memory)
- `README.md` — what this repo is and how it is organised.
- `docs/methodology.md` — how Nia is built (this process).
- `docs/adr/` — every accepted architecture decision, in full. **Read these before
  proposing any alternative** (`methodology.md` → Architecture Decisions).
- `DECISIONS.md` — the decision register (ADR index + open decisions awaiting a ruling).

## 3. Read the current task
- A feature needs a **Product specification** first (Phase 1) — owned by Founder/Product,
  not the AI Engineer. If no spec exists, ask for one; do not invent what to build.

## 4. Plan (Phase 2 — no code)
- Identify dependencies, risks, and the smallest reviewable tasks. Produce a plan.
  Wait for approval before building.

## 5. Build one vertical slice (Phase 3)
- Build vertically (DB → API → Flutter → tests → docs → deployable), never horizontally.
- Each task is one small, tested, reversible PR that references the relevant Nia OS
  sections. No unrelated refactoring, no speculative work, no hidden changes.

## 6. Review behaviour (Phase 4) and merge (Phase 5)
- Review asks: does it behave correctly, follow Nia OS, improve the Member experience,
  and avoid drift? On approval: merge, update the repository, update docs/ADRs, close
  the task.

## Roles, in one line
Founder/Product decide **what** is built and **how the experience works**; the AI
Engineer decides **how to implement** — never what to build (`docs/methodology.md`).

## Where we are
- **Session 1 — Architecture:** done (the readiness plan).
- **Session 2 — Repository foundation:** done (PR #1; this PR adds the methodology and ADRs).
- **Session 3 — Membership:** next. Needs a Product spec (Phase 1) before AI planning.

Session map: Architecture → Repository foundation → Membership → Wallet →
Wallet Overview → Onboarding → Savings → Remittance → Operator → RafiQi.

## When you make a new significant decision
Write a new ADR in `docs/adr/` (Problem · Options · Decision · Reasoning · Consequences)
**before** writing the code that depends on it, and add it to the register in
`DECISIONS.md`.
