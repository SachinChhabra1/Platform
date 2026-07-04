# Autonomous engineering loop — operating rules

How an autonomous session works this repository. Read with [`../ROADMAP.md`](../ROADMAP.md),
[`../NEXT_TASK.md`](../NEXT_TASK.md), and [`PROJECT_STATUS.md`](PROJECT_STATUS.md). The
repository — not any conversation — is the memory.

## The loop

Recover context → determine state (trust the repo over stale docs) → write an implementation
contract (Goal, Files, Acceptance, Tests, Rollback) → build only that slice → verify to green
→ audit own work → refactor if safe → update state docs → single-purpose commit → decide next.

**If no unlocked roadmap task exists, do not stop. Create one from the repository** (below).

## When the roadmap is empty or blocked

A lack of explicit roadmap work does not mean engineering is finished. Work this ladder in
order; the first category that yields real, in-authority work becomes the next task:

1. **Technical debt** — duplicated code, dead code, unnecessary abstractions, inconsistent
   naming, oversized files/widgets, architecture violations, lint opportunities.
2. **Missing tests** — production code without sufficient coverage.
3. **Documentation drift** — implementation ahead of docs.
4. **Product polish** — simpler / clearer / faster / more consistent, **only where it needs
   no Founder decision and stays within established patterns**.
5. **Engineering improvements** — build speed, code organisation, dependency hygiene, error
   handling, logging/observability, accessibility, localization readiness — **behaviour
   identical**.

A task must be **grounded** (found by inspecting the repo, e.g. grep/analyze/coverage), not
invented. Prefer changes that keep the five golden screenshots **byte-identical** — that is
the proof the board-frozen product is untouched.

## Only then evaluate stop conditions

Conclude the repository is blocked (and stop) only when **all** are true: no roadmap work,
no technical debt, no safe refactor, no documentation drift, no missing tests, no engineering
improvement, and no Founder-approved product work available.

## Engineering authority

**May do autonomously** (no Founder sign-off):
- Refactor code without changing behaviour · improve performance · improve accessibility ·
  add/improve tests · improve documentation · simplify architecture · remove dead code ·
  improve naming/consistency · fix bugs · reduce technical debt · strengthen recovery and
  automation.

**Must NOT do autonomously** (needs the Founder):
- Change product behaviour · introduce new user-facing features · change business rules ·
  alter visual design beyond established patterns · modify roadmap priorities · **override a
  Founder freeze or the board-demo lock.**

The balance: keep the loop productive on engineering quality without wandering into product
decisions. When a genuinely useful change would cross the "must not" line, record it as a
gated roadmap item (`ROADMAP.md`) and keep going on what is in-authority.
