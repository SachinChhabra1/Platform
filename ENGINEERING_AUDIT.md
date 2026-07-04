# Engineering Audit

A grounded snapshot of engineering health and the prioritized backlog it implies. This is the
durable output of the loop's Phase-2 repository scan. Re-run at each Engineering Council review
(every 10 slices) and after major work. Scores are evidence-based, not aspirational.

**Audited:** 2026-07-04, HEAD `ec8be4b`. **Method:** `flutter analyze`, `flutter test`, golden
diff vs the board freeze, and a repository scan (TODOs, dead code, test gaps).

## Scorecard (member app — the production focus)

| Area | State | Evidence |
|---|---|---|
| Build / verify | ✅ | `nia verify` green · no codegen drift |
| Static analysis | ✅ | `flutter analyze lib test` — no issues |
| Tests | ✅ | 72 pass across 17 files |
| Goldens | ✅ frozen | all 5 byte-identical to `795b0de` |
| Dead code / TODOs | ✅ | 0 `TODO/FIXME` in `lib`; pillar_kit dead code removed (E1) |
| Documentation | ✅ | manual 00–17 grounded; Product Bible from mining; links resolve |
| Tech debt | 🟡 | one known duplication (E4) — **gated** (touches frozen NiaBook screen) |
| Test coverage breadth | 🟡 | screens/components/formatPaise/common covered; backend services not covered here (paused) |
| Native release readiness | 🔴 | web-only; no iOS/Android build, no CI (K1) |
| Backend | ⏸ paused | M1 slice only; money-movement flows gated on OD-1…OD-6 |

## Strengths

Single source of truth with a tie-break constitution; clear founder/engineering authority; the
autonomous loop with budgets + regression budget; verified recovery bundles; the five screens
frozen and proven byte-identical; grounded documentation.

## Gaps / findings (grounded)

1. **E4 duplication** — `niabook_page._sosButton/_iconChip` vs `pillar_kit.niaSosButton/niaIconChip`.
   Real debt, but golden-risky → **gated** until the board freeze lifts. `ROADMAP.md` E4.
2. ~~`widgets/common.dart` test gap~~ — **CLOSED (E6)**: `test/common_test.dart` covers Monogram,
   SectionLabel, prototypeNoOp, and the SOS → Operator sheet. Suite 68 → 72.
3. **No CI** — tests run locally only. Adding CI is in-authority (DX/reliability) but bigger; record
   as a roadmap item rather than a snap change. **Next in-authority candidate.**
4. **Native + hosting** — `KNOWN_BUGS.md` K1/K2; Founder-gated (needs accounts/device).

## Prioritized backlog

- **Unlocked (in-authority, golden-neutral):** close the `common.dart` test gap (finding 2); then
  consider a CI setup slice (finding 3).
- **Gated (Founder / freeze):** E4 + R1 (board freeze) · R2 native (K1) · R3–R8 backend (OD-1…OD-6).
  Tracked in `ROADMAP.md`; decisions in `FOUNDER_REVIEW.md`.

## Scope note

This audit covers the **member app** (the production focus). The Console/Operator apps and the
paused backend services are out of scope until the Founder resumes them; audit them when they
become active.
