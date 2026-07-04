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
| E1 | Remove dead code in `pillar_kit.dart` (`niaCard`, `niaListRow`, `niaBookStrip`, `sectionTitle` — superseded by `nia_components.dart`, zero callers) | ✅ DONE | Golden-neutral; analyze/49 tests green. |
| E2 | Add direct tests for the shared component surface `nia_components.dart` (InfoCard styles, ListRow semantics/trailing, SummaryCard icon param, SectionHeader, OpportunityCard, NiaReveal) | ✅ DONE | +11 tests (49 → 60); goldens untouched. |
| E3 | Audit pass for further grounded debt | ✅ DONE | No further dead code; remaining safe queue exhausted. |
| E5 | Unit-test `formatPaise` (Indian ₹ grouping/sign/rounding) + `NiaBookMonth.sample` invariants | ✅ DONE | +8 tests (60 → 68); goldens untouched. |
| E6 | Test `widgets/common.dart` (Monogram, SectionLabel, prototypeNoOp, SOS→Operator sheet) | ✅ DONE | +4 tests (68 → 72); goldens untouched. |
| E7 | CI setup | ✅ ALREADY PRESENT | `.github/workflows/ci.yml` predates the loop (lint/contract/TS/Flutter gates). No work needed. Activating it on a GitHub runner is a Founder call — `FOUNDER_REVIEW.md` Q7. |
| E4 | Unify SOS + icon-chip duplication | ✅ DONE (scoped) | SOS deduped — NiaBook now uses `niaSosButton` (byte-identical; goldens unchanged). Icon-chip **kept separate by design:** NiaBook's chip carries the R1a ○→✓ motion + a lock badge the pillar chip lacks, and merging would create a circular `pillar_kit ↔ nia_components` import for marginal gain. Engineering call, documented. |

## Now (R1 COMPLETE)

The board freeze is lifted. **R1 (the craftsmanship backlog) is complete** — all four items:

**R1:** ✅ #2 ○→✓ motion (R1a) · ✅ #1 Living "spend less" (Included) · ✅ #3 per-pillar emotional
register via non-colour levers — motion timing + density (Q8) · ✅ #4 → **Continuity Coaching**,
one calm next step per screen (Q9). Plus E4 (SOS dedup) and the progress-not-engagement law.

## R9 — Production Readiness (Production Readiness Lead mode)

Founder ruling (2026-07-04): when the feature roadmap is gated, become **Production Readiness Lead**
and work R9 — the final 10% that turns a demo into software people trust. Not features. Populated from
**repository inspection**, each item tagged by authority. The loop executes the 🔓 items; 🔒 items are
audited and recorded, not faked. Loop rule: [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md).

**In-authority + executable now (🔓) — the loop works these:**

| # | Item | Grounding (found by inspection) | Status |
|---|------|--------------------------------|--------|
| R9.1 | **Live-surface error / offline states** | 6 `FutureBuilder`s on the live surfaces (`home_page` ×2, `wallet_page`, `my_family_page`, `profile_page`, `membership_header`) handle `!hasData` (spinner) but **not `hasError`** → an API failure / airplane mode / 4xx-5xx / timeout / the source's own `StateError` leaves the UI spinning forever. Golden-neutral (frozen screens render synchronously). | 🔓 IN PROGRESS |
| R9.2 | **Empty-state review** | Confirm every zero/empty case is intentional (wallet empty story; `my_family` "Nothing sent home yet"; zero-savings). | 🔓 TODO |
| R9.3 | **Loading states reassure** | Bare `CircularProgressIndicator`s on live surfaces — make them calm/consistent, not a raw spinner. | 🔓 TODO |
| R9.4 | **Accessibility audit** | 16 semantics uses today; `nia_bottom_nav` is exemplary (Semantics + Tooltip). Audit icon-only controls (SOS, chevrons), `Monogram`/image semantics, tap targets ≥48px, text-scale resilience, contrast vs Book III. Semantics are golden-neutral. | 🔓 TODO |
| R9.5 | **Crash recovery / error boundary** | No custom `ErrorWidget.builder`; a widget build error shows the raw red screen. Add a calm release fallback. | 🔓 TODO |

**In-authority to AUDIT, changes gated (🟡) — a change to a frozen screen needs a Founder-approved screen change (golden-risk):**

| # | Item | Note |
|---|------|------|
| R9.6 | **Motion audit** | `MovementCheck` / `NiaReveal` timing + curve consistency across screens. Audit is in-authority; altering a frozen screen's render is a Founder-approved screen change. |
| R9.7 | **Typography audit** | `theme/nia_theme.dart` scale vs Book III; consistency. Audit in-authority; changes to frozen screens gated. |

**Gated on the native build (🔒 R2 / K1) — cannot be measured web-only; audit & record, don't fake:**

| # | Item | Gate |
|---|------|------|
| R9.8 | Launch-time / startup profiling | Needs a native/profile build (web only today — K1). |
| R9.9 | Low-end Android · battery · memory profiling | Needs a physical device + native build. |
| R9.10 | Play Store checklist · release-candidate review | Needs native build + store account (Founder). |

**Gated on the Founder (🔒):**

| # | Item | Gate |
|---|------|------|
| R9.11 | Analytics instrumentation | Must not conflict with the **progress-not-engagement** law (`PRODUCT_ARCHITECTURE.md`). *What* is legitimate to measure is a Founder call. |

## Next — all GATED (nothing is unlocked right now)

| # | Task | Status | Gate / blocker |
|---|------|--------|----------------|
| R1 | Craftsmanship backlog (`docs/design/niabook/niabook-next-iteration.md`) — 4 items | 🔓 IN PROGRESS | Freeze lifted. #2 ○→✓ motion **done** (R1a); #1 Living middle, #3 emotional register, #4 daily-return pull remain. |
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
