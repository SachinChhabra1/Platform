# Roadmap

The ordered, honest task queue for the Nia build. A task is **UNLOCKED** only if it can be
started without a Founder decision and without violating a recorded freeze. The autonomous
engineering loop executes the top UNLOCKED task; if none exists, it stops (that is not
failure — it is the queue correctly reporting a gate).

Canonical references: [`PRODUCT_ARCHITECTURE.md`](PRODUCT_ARCHITECTURE.md) (what Nia is),
[`DESIGN_SYSTEM_LOCK.md`](DESIGN_SYSTEM_LOCK.md) (the locked screens), [`DECISIONS.md`](DECISIONS.md)
(ADRs + open decisions), [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) (current state).
Loop rules + what may be done without a Founder decision: [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md).

## Engineering quality — UNLOCKED (in-authority, behaviour-preserving)

These need no Founder decision and keep the five goldens byte-identical (they don't touch the
frozen screens' renders). The loop works these when no product task is unlocked.

| # | Task | Status | Notes |
|---|------|--------|-------|
| E1 | Remove dead code in `pillar_kit.dart` (`niaCard`, `niaListRow`, `niaBookStrip`, `sectionTitle` — superseded by `nia_components.dart`, zero callers) | 🔓 UNLOCKED | Golden-neutral. |
| E2 | Add direct tests for the shared component surface `nia_components.dart` (InfoCard styles, ListRow semantics/trailing, SummaryCard icon param, SectionHeader, OpportunityCard, NiaReveal) | 🔓 UNLOCKED | Purely additive coverage. |
| E3 | Further debt as found by audit (grounded only) | 🔓 OPEN | Next audit pass. |

## Now (frozen)

The five-screen operating system is **complete and frozen for the board meeting**. Do not
change product code, copy, or goldens before the board meeting — this is a Founder freeze
(`docs/design/niabook/BOARD-HANDOVER.md`).

## Next — all GATED (nothing is unlocked right now)

| # | Task | Status | Gate / blocker |
|---|------|--------|----------------|
| R1 | Craftsmanship backlog — NiaBook ○→✓ motion visible; per-pillar emotional register; even daily-return pull (`docs/design/niabook/niabook-next-iteration.md`) | 🔒 LOCKED | Founder deferred until **after the board meeting**. |
| R2 | Native packaging — get the app onto a phone as an installable (Android APK, then iOS/TestFlight) | 🔒 LOCKED | Founder decision: web-only was chosen for the demo; native needs accounts/signing + a "do this" from the Founder. See [`KNOWN_BUGS.md`](KNOWN_BUGS.md) K1. |
| R3 | Wage Flow slice (backend) | 🔒 LOCKED | Backend paused **and** OD-1 ruling required (`DECISIONS.md`). |
| R4 | Remittance completion (backend) | 🔒 LOCKED | Backend paused **and** OD-2 ruling required. |
| R5 | RafiQi orchestration (backend) | 🔒 LOCKED | Backend paused **and** OD-3 ruling required. |
| R6 | Offline write paths | 🔒 LOCKED | Backend paused **and** OD-4 ruling required. |
| R7 | Savings Flow (backend) | 🔒 LOCKED | Backend paused **and** OD-5 ruling required. |
| R8 | Dignity gates / The Floor | 🔒 LOCKED | Backend paused **and** OD-6 ruling required. |

## How the loop unlocks a task

- **R1** unlocks the moment the Founder says the board meeting is done (or "start the
  backlog"). It touches only the frozen screens, so it cannot start before then.
- **R2** unlocks when the Founder says to build a native install and confirms the target
  (Android first is fastest) — it needs their device/accounts.
- **R3–R8** unlock when (a) the backend is un-paused and (b) the matching OD-# is ruled
  (a ruling becomes an ADR). OD-1…OD-6 expire 2026-07-13.

## Done

- Product Polish: all five screens hardened to App-Store quality + integrated + verified
  (see [`CHANGELOG.md`](CHANGELOG.md) and `docs/PROJECT_STATUS.md`).
- Loop scaffolding: this roadmap + `KNOWN_BUGS.md` + `NEXT_TASK.md` + `SESSION.md` +
  `CHANGELOG.md` established so future autonomous sessions run from the repo, not chat.
