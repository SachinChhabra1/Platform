# Engineering Audit

A grounded snapshot of engineering health and the prioritized backlog it implies. This is the
durable output of the loop's Phase-2 repository scan. Re-run at each Engineering Council review
(every 10 slices) and after major work. Scores are evidence-based, not aspirational.

**Audited:** 2026-07-04, HEAD `d3bd715`. **Method:** `flutter analyze`, `flutter test`, golden
diff vs the board freeze, and a repository scan (TODOs, dead code, test gaps).

## Scorecard (member app — the production focus)

| Area | State | Evidence |
|---|---|---|
| Build / verify | ✅ | `nia verify` green · no codegen drift |
| Static analysis | ✅ | `flutter analyze lib test` — no issues |
| Tests | ✅ | 85 pass across 18 files |
| Goldens | ✅ | deterministic; intentionally updated by R1 (freeze lifted) — see `docs/design/niabook/R1-visual-review.md` |
| Dead code / TODOs | ✅ | 0 `TODO/FIXME` in `lib`; pillar_kit dead code removed (E1) |
| Documentation | ✅ | manual 00–17 grounded; Product Bible from mining; links resolve |
| Tech debt | ✅ | E4 resolved (SOS deduped; icon-chip kept separate by design) — no open debt |
| Test coverage breadth | 🟡 | screens/components/formatPaise/common covered; backend services not covered here (paused) |
| CI | ✅ configured | `.github/workflows/ci.yml`: lint-gates (+ self-test), OpenAPI-contract, TS typecheck+test, Flutter analyze+test (pinned 3.44.4). Caveat: `origin` is a local recovery bundle, so CI runs only when pushed to a GitHub remote. |
| Native release readiness | 🔴 | web-only; no iOS/Android build (K1) |
| Backend | ⏸ paused | M1 slice only; money-movement flows gated on OD-1…OD-6 |

## Strengths

Single source of truth with a tie-break constitution; clear founder/engineering authority; the
autonomous loop with budgets + regression budget; verified recovery bundles; the five screens
frozen and proven byte-identical; grounded documentation.

## Gaps / findings (grounded)

1. ~~**E4 duplication**~~ — **RESOLVED** (freeze lifted, R1). SOS deduped — NiaBook uses the shared
   `niaSosButton` (byte-identical). Icon-chip kept separate by design (R1a ○→✓ motion + lock badge;
   avoids a circular `pillar_kit ↔ nia_components` import). `ROADMAP.md` E4.
2. ~~`widgets/common.dart` test gap~~ — **CLOSED (E6)**: `test/common_test.dart` covers Monogram,
   SectionLabel, prototypeNoOp, and the SOS → Operator sheet. Suite 68 → 72.
3. **CI exists** — `.github/workflows/ci.yml` already runs lint/contract/TS/Flutter gates. It is
   comprehensive; no CI *setup* work is needed. Only open item: CI executes on a GitHub runner
   only if the repo is pushed to a GitHub remote (today `origin` is a local bundle) — a Founder
   call, not engineering. Recorded as `FOUNDER_REVIEW.md` Q7.
4. **Native + hosting** — `KNOWN_BUGS.md` K1/K2; Founder-gated (needs accounts/device).

## Prioritized backlog

- **Unlocked (in-authority):** **R9 — Production Readiness** (Founder ruling, 2026-07-04) — see
  `ROADMAP.md`. R9.1 (live-surface error/offline states) done; R9.2 empty states, R9.3 loading
  states, R9.4 accessibility audit, R9.5 crash-recovery boundary remain in-authority. The member app
  is otherwise clean (analyze/85 tests/goldens deterministic), dead code removed, E4 resolved, R1
  complete. Test-adding into legacy/prototype surfaces stays low value (retirement candidates — Q3).
- **Gated (Founder):** R2 native (K1) · R3–R8 backend (OD-1…OD-6) · retiring the legacy wallet/home
  surfaces (Q3, a Founder product call) · pushing to a GitHub remote to activate CI (Q7). Tracked in
  `ROADMAP.md` / `FOUNDER_REVIEW.md`.

## Scope note

This audit covers the **member app** (the production focus). The Console/Operator apps and the
paused backend services are out of scope until the Founder resumes them; audit them when they
become active.
