# Roadmap

The ordered, honest task queue for the Nia build. A task is **UNLOCKED** only if it can be
started without a Founder decision and without violating a recorded freeze. The autonomous
engineering loop executes the top UNLOCKED task; if none exists, it stops (that is not
failure — it is the queue correctly reporting a gate).

Canonical references: [`PRODUCT_ARCHITECTURE.md`](PRODUCT_ARCHITECTURE.md) (what Nia is),
[`DESIGN_SYSTEM_LOCK.md`](DESIGN_SYSTEM_LOCK.md) (the locked screens), [`DECISIONS.md`](DECISIONS.md)
(ADRs + open decisions), [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) (current state).
Loop rules + what may be done without a Founder decision: [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md).

## Program structure — three parallel streams (Founder ruling, 2026-07-04)

R9 is **not the terminal gate before backend**. It is a **parallel Production Hardening stream**. Once
R9 is signed off, the program runs three streams at once, like a real engineering org:

| Stream | Owner | Scope |
|---|---|---|
| **Backend** — R3 Wage Flow · R4 Remittance · R5 RafiQi · R6 Offline · R7 Savings · R8 Floor/dignity gates (R2 native packaging is separate) | **Claude** | The forward path — **now UNLOCKED** (OD-1…OD-6 ruled + Locked, backend un-paused). Build strictly against `ENGINEERING_LOCK.md`; R3 first. |
| **Design evolution** — motion, typography, micro-interactions | **Vercel / design** | Visual refinement in parallel; lands in Flutter as Founder-approved screen changes (Q11). |
| **Business decisions** — OD-1…OD-6 (✅ ruled 2026-07-04), business rules, real API contracts | **Founder** | OD-1…OD-6 resolved and Locked. Remaining Founder calls: R2 native go-ahead, Q11 frozen-screen change. |

**R9 — Production Hardening: ✅ SIGNED OFF (2026-07-04)** — [`R9_SIGNOFF.md`](R9_SIGNOFF.md). In-authority
scope complete; residual items are gated (native build R2/K1, or a frozen-screen change Q11) and do not
hold R9 open. The forward path is now **backend (R3–R8), UNLOCKED** as of 2026-07-04 (OD-1…OD-6 ruled +
Locked) — see the stream table above. R2 native packaging remains a separate Founder go-ahead.

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
| E8 | OpenAPI contract lint via glob | ✅ DONE | The contract-lint list had drifted — `openapi.sessions.yaml` (a live contract) was ungated in both `scripts/verify.sh` and CI. Switched both to `openapi.*.yaml` so every spec is gated on landing. |
| E9 | Doc-link integrity gate | ✅ DONE | `scripts/check-doc-links.mjs` fails the build on any broken relative link in hand-authored docs (protects the governance chain: Constitution → ADRs → OD book → briefs → lock → roadmap). Fail-closed; 221 links clean; wired into verify + CI. |
| E10 | Engineering-quality loop — sweep 1 | ✅ DONE | Confirmed no remaining safe gap: infra (`runtime`/`log`/`sessions`/`preview`) well-tested; lockfile frozen-clean; `.nvmrc` consistent; only dep updates are risky majors (TS 6, Vitest 4, Redocly 2 — not behaviour-preserving). CHANGELOG brought current. |
| E11 | Doc-link gate self-test (fail-closed proof) | ✅ DONE | Split the doc-link gate into the repo's lib/cli/selftest trio (`doclinks.mjs` / `check-doc-links.mjs` / `check-doc-links.selftest.mjs` + `__doclink_fixtures__`), so it proves it catches a planted broken link before it is trusted — matching `scripts/lint/selftest.mjs`. Wired ahead of the real check in verify + CI. |
| E12 | Doc-accuracy sweep | ✅ DONE | Fixed a live contradiction in `PROJECT_STATUS.md` (a historical "current = 77 tests" vs the canonical 92 top line; reworded as R1 snapshots per R9.0's single-source rule); README's `verify` description now lists the doc-link gate. Dated audit snapshots (ENGINEERING_AUDIT / KNOWN_BUGS / SESSION at HEAD `d3bd715`) left intact as history. **Next valuable engineering work is money-path/behaviour testing (wallet/wage/remittance/savings) — OD-gated** (those tests assert behaviour OD-1…OD-6 must *define* first). Blocker in `NEXT_TASK.md`. |

## Now (R1 COMPLETE)

The board freeze is lifted. **R1 (the craftsmanship backlog) is complete** — all four items:

**R1:** ✅ #2 ○→✓ motion (R1a) · ✅ #1 Living "spend less" (Included) · ✅ #3 per-pillar emotional
register via non-colour levers — motion timing + density (Q8) · ✅ #4 → **Continuity Coaching**,
one calm next step per screen (Q9). Plus E4 (SOS dedup) and the progress-not-engagement law.

## R9 — Production Hardening · ✅ SIGNED OFF (2026-07-04) — [`R9_SIGNOFF.md`](R9_SIGNOFF.md)

**R9's in-authority scope is complete and signed off.** It ran `audit → fix → verify → sign-off` and does
**not** stay open for perpetual polish. Every category below is ✅ in-authority-complete or 🔒 Founder-gated;
no open in-authority R9 work remains. R9 is now a **parallel hardening stream** (see the stream table at
the top), not a gate before backend. The forward path is **R2–R8 (backend)**.

Founder ruling (2026-07-04): when the feature roadmap is gated, become **Production Readiness Lead**
and work R9 — the final 10% that turns a demo into software people trust. Not features. Populated from
**repository inspection**, each item tagged by authority. The loop executes the 🔓 items; 🔒 items are
audited and recorded, not faked. Loop rule: [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md).

**Finish categories, not files** (Founder ruling): each category runs **audit → fix → verify → close**;
never leave one partially complete if it can be finished within the slice (`docs/AUTONOMOUS-LOOP.md`).

### Category matrix

| Category | Audit | Fix | Tests | Complete | Notes |
|---|:--:|:--:|:--:|:--:|---|
| Async states | ✅ | ✅ | ✅ | ✅ | Every implemented surface — [`R9_ASYNC_STATE_AUDIT.md`](R9_ASYNC_STATE_AUDIT.md) |
| Empty states | ✅ | ✅ | ✅ | ✅ | Confirmed within the async audit (`my_family` "Nothing sent home yet"; wallet N/A) |
| Offline | ✅ | ✅ | ✅ | ✅ | Folded into async (sign-in offline kept distinct from default-deny) |
| Crash recovery | ✅ | ✅ | ✅ | ✅ | R9.5 — global `ErrorWidget.builder` calm fallback |
| Housekeeping · test-count restatement | ✅ | ✅ | — | ✅ | R9.0 — consolidated to one canonical count |
| Accessibility | ✅ | ✅¹ | ✅ | ✅/🔒 | In-authority complete (labels/roles/headers/contrast — [`R9_ACCESSIBILITY_AUDIT.md`](R9_ACCESSIBILITY_AUDIT.md)); ¹ residual 🔒: sub-48px tap targets + text-scale reflow on the 5 frozen screens (Q11) |
| Motion | ✅ | ✅ | ✅ | ✅ | Whole-app audit ([`R9_MOTION_AUDIT.md`](R9_MOTION_AUDIT.md)); golden-neutral reduce-motion fix on both primitives (+2 tests). Only deferred item is a *branded* route transition (product call, not readiness) |
| Typography | ✅ | 🔒 | — | ✅/🔒 | Audit complete, family/colour/weight pass ([`R9_TYPOGRAPHY_AUDIT.md`](R9_TYPOGRAPHY_AUDIT.md)); residual 🔒: reconcile ~11 inline sizes to the 7-step scale + `TextScaler` clamp — repaints frozen screens (Q11) |
| Performance (launch/low-end/battery/memory) | 🔒 | 🔒 | — | 🔒 | Gated on the native build (K1/R2) — unmeasurable web-only |

Legend: ✅ done · ✅/🔒 in-authority complete, residual Founder-gated · 🟡 in progress · ⬜ not started ·
🔒 gated · — N/A. For **R9 sign-off**, a category is closed when it is ✅ or ✅/🔒 (all in-authority
work done; any remainder genuinely gated). No category is 🟡 or ⬜ — R9 is signed off ([`R9_SIGNOFF.md`](R9_SIGNOFF.md)).

**In-authority + executable now (🔓) — the loop works these:**

| # | Item | Grounding (found by inspection) | Status |
|---|------|--------------------------------|--------|
| R9.0 | **Consolidate the restated test count** | ✅ Canonical count now lives only in `docs/PROJECT_STATUS.md` (+ the `NEXT_TASK` per-session verification stamp); the ~6 peripheral docs describe the suite without a number. A test-adding slice updates one file, not ten. | ✅ DONE |
| R9.1 | **Live-surface error / offline states** | ✅ `NiaAsyncView` (loading · calm error · Retry) now backs the money surfaces (`home` balance, `wallet_page`, `my_family_page`) and `profile_page`'s standing — an API failure / airplane mode / timeout shows a recoverable error, not an endless spinner. `membership_header` degrades gracefully to a placeholder by design (identity chrome). Golden-neutral; +5 tests. | ✅ DONE |
| R9.2 | **Async state audit** — complete state machine for every async surface | ✅ Full inventory in [`R9_ASYNC_STATE_AUDIT.md`](R9_ASYNC_STATE_AUDIT.md). Hardened `membership_header` (identity) and `phone_sign_in` (offline now distinct from default-deny); documented the Home-greeting graceful exception; confirmed empty states intentional (`my_family`). Every **implemented** async surface has a complete state model. +3 tests. | ✅ DONE |
| R9.3 | **Loading states reassure** | ✅ Loading is calm and consistent via `NiaAsyncView`/`NiaAsyncLoading` (each surface keeps its footprint); no raw uncontained spinners on the live surfaces. | ✅ DONE |
| R9.4 | **Accessibility audit** | ✅ (in-authority) Whole-app audit in [`R9_ACCESSIBILITY_AUDIT.md`](R9_ACCESSIBILITY_AUDIT.md). Fixed golden-neutral: SOS labelled button, NiaBook language/month toggles as buttons, `Monogram` excluded, `SectionLabel`s as headers, Profile call tooltip. Contrast passes (WCAG AA). +3 tests. **Gated (Q11):** sub-48px tap targets + text-scale reflow on the 5 frozen screens (moves goldens). | ✅ DONE (in-authority) |
| R9.5 | **Crash recovery / error boundary** | ✅ `installNiaCrashBoundary()` sets `ErrorWidget.builder` (release/profile; debug keeps the dev red screen) to a calm `NiaErrorScreen` ("Nia is still here — your money and your record are safe"); wired into both entrypoints. +2 tests. | ✅ DONE |

**In-authority to AUDIT, changes gated (🟡) — a change to a frozen screen needs a Founder-approved screen change (golden-risk):**

| # | Item | Note |
|---|------|------|
| R9.6 | **Motion audit** | ✅ DONE (in-authority + fix) — whole-app audit in [`R9_MOTION_AUDIT.md`](R9_MOTION_AUDIT.md). All motion is one-shot `TweenAnimationBuilder` (no controllers/tickers/spinners, goldens safe); per-pillar durations encode the Q8 register deliberately. Fixed **golden-neutral**: both primitives (`NiaReveal`, `MovementCheck`) now honor `MediaQuery.disableAnimations` (OS Reduce Motion), snapping to the final frame — settled frame and all five goldens unchanged. +2 tests. Only deferred item is a *branded* route transition (a product/motion Founder call, not a readiness fix). |
| R9.7 | **Typography audit** | ✅ DONE (in-authority) — whole-app audit in [`R9_TYPOGRAPHY_AUDIT.md`](R9_TYPOGRAPHY_AUDIT.md). One family / colour-via-tokens / two-weight discipline all **pass**. Debt recorded: the 7-step theme scale (`theme/nia_theme.dart`, Book III §2.2) is **bypassed by ~11 inline `fontSize` values** (7 off-scale), and no `TextScaler` clamp. Reconciling repaints the frozen screens → **gated (Q11)**, same gate as the a11y text-scale item. |

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
| R3 | Wage Flow slice (backend) | 🔓 UNLOCKED | Backend un-paused; **OD-1 ruled** ([ADR-0012](docs/adr/0012-wage-flow-shortfall-priority.md), Locked). Build strictly against `ENGINEERING_LOCK.md`. **Critical path — start here.** |
| R4 | Remittance completion (backend) | 🔓 IN PROGRESS | **OD-2 ruled** ([ADR-0013](docs/adr/0013-remittance-confirmed-and-sla.md), Locked). Domain (state machine, escalation/store seams) + Member-facing endpoint & `openapi.remittance.yaml` done ("sent" ≠ confirmed; confirmed = recipient-available; 24h SLA → Operator; family ack optional; owner-only reads), +19 tests. Remaining (infra, no OD): rail webhook adapter + scheduled SLA sweep. |
| R5 | RafiQi orchestration (backend) | 🔓 IN PROGRESS | **OD-3 ruled** ([ADR-0014](docs/adr/0014-rafiqi-reversibility-and-consent.md), Locked). Domain + Member-facing endpoints (`openapi.rafiqi.yaml`: grant/revoke/list grants, list/read/reverse actions) done — scoped/capped/time-bounded/revocable consent, auto-vs-confirmation fallback, 24h reversibility (409 after window), owner-only, +23 tests. Remaining (infra, no OD): RafiQi orchestrator wiring (auto-take) + reversal → target money-path compensation. |
| R6 | Offline write paths | 🔓 DONE (domain+endpoint) | **OD-4 ruled** ([ADR-0015](docs/adr/0015-offline-conflict-resolution.md), Locked). Per-record-class reconciliation (`offline_sync.ts`): money server-authoritative-with-reconciliation (proposal; diverged → Operator, never overwritten), intent last-write-wins, append-only merge; `POST /v1/sync` batch endpoint (`openapi.sync.yaml`), +16 tests. Remaining (infra): the real Operator reconciliation UI + durable sync store. |
| R7 | Savings Flow (backend) | 🔓 DONE (domain+endpoint) | **OD-5 ruled** ([ADR-0016](docs/adr/0016-savings-withdrawal-mechanics.md), Locked). Withdrawal mechanics (`savings.ts`): instant-to-Wallet (`available` immediately), T+n settle (rail-driven, off the Member API), interest to the Member net of a disclosed fee, no early-withdrawal penalty (available == requested; locked accounts refused, not penalised); money conserved. Member-facing endpoints (`openapi.savings.yaml`: read account, request/list/read withdrawals) + accrue-on-read, +32 tests. **Interest rate/formula/fee + `n` are Founder-owned config behind the `InterestAccrualPolicy` seam / `settleAfterMs` — no number invented** (recorded judgment in [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md)). Remaining (infra, no OD): the interest-accrual job + rail settlement adapter + durable store; wiring the wage waterfall's `savings` deposit in. |
| R8 | Dignity gates / The Floor | 🔓 UNLOCKED | Backend un-paused; **OD-6 ruled** ([ADR-0017](docs/adr/0017-the-floor-authoritative-source.md), Locked). |

## How the loop unlocks a task

- **R1** unlocks the moment the Founder says the board meeting is done (or "start the
  backlog"). It touches only the frozen screens, so it cannot start before then.
- **R2** unlocks when the Founder says to build a native install and confirms the target
  (Android first is fastest) — it needs their device/accounts.
- **R3–R8** are **UNLOCKED** (2026-07-04): backend un-paused and OD-1…OD-6 ruled + Locked
  ([`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md), ADRs 0012–0017). Build each strictly against its locked
  decision; if implementation reveals an uncovered product decision, **stop and open a new OD** — do not
  invent behaviour (`docs/AUTONOMOUS-LOOP.md`). **R3 (Wage Flow) is the critical path — start there.**

## Done

- Product Polish: all five screens hardened to App-Store quality + integrated + verified
  (see [`CHANGELOG.md`](CHANGELOG.md) and `docs/PROJECT_STATUS.md`).
- Loop scaffolding: this roadmap + `KNOWN_BUGS.md` + `NEXT_TASK.md` + `SESSION.md` +
  `CHANGELOG.md` established so future autonomous sessions run from the repo, not chat.
