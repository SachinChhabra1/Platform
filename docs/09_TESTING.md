# Testing

How NiaBook is verified. Grounded in the real suite (`apps/member/test/`). The rule: **green
before commit, and the five golden screenshots stay byte-identical unless a screen change is
intended and approved.**

## What to run

```sh
cd ~/Developer/"Nia Development" && source scripts/_env.sh   # puts flutter/node on PATH
cd repo/apps/member
flutter analyze lib test          # static analysis — must be clean
flutter test                      # full suite — must be all green
# regenerate the five board screenshots (demo artefacts, not assertions):
flutter test test/niabook_golden_test.dart --update-goldens
```

Repository-wide gate: **`nia verify`** (from repo root, after `source scripts/_env.sh`) runs the
suite plus a non-destructive codegen-drift check. It must end `nia verify passed`.

## The suite (81 tests today)

- **Screen contracts** — `pillars_test.dart` (each pillar's promise, hero, benefit-led copy,
  cross-pillar tags, emotional close) and `niabook_page_test.dart`.
- **Shared components** — `nia_components_test.dart`: InfoCard styles, ListRow semantics/tap,
  SummaryCard icon, SectionHeader, OpportunityCard, NiaReveal.
- **Pure logic** — `niabook_scenario_test.dart`: `formatPaise` (Indian ₹ grouping, sign,
  half-away-from-zero rounding) + sample invariants.
- **Shell / nav** — `widget_test.dart`, `bottom_nav_test.dart`: boots on NiaBook, five anchors
  in order, tab switching.
- **Golden screenshots** — `niabook_golden_test.dart`: renders the five approved screens with
  real SF + Material fonts to `test/goldens/*.png`. These are **demo artefacts**, not pass/fail
  assertions; their job is visual review + freeze proof.
- **Live-surface async states** — `async_states_test.dart` (R9.1): a failed fetch shows a calm,
  recoverable error (not an endless spinner), and Retry re-fetches and recovers.
- Plus prototype-invariant, preview-screen, config, membership, and family tests.

## The golden rule (the goldens are the visual spec)

The five goldens are the visual spec. A behaviour-preserving change (refactor, dead-code removal,
added test) must leave `test/goldens/*.png` **byte-identical**:

```sh
flutter test test/niabook_golden_test.dart --update-goldens
git diff --quiet -- apps/member/test/goldens/ && echo "byte-identical ✓"
```

If the goldens change and you did not intend a screen change, **revert** — you altered the visual
spec unintentionally. Only a Founder-approved product change may alter them. (The board freeze has
been lifted; R1 was such an approved change and intentionally regenerated the goldens — see
`design/niabook/R1-visual-review.md`.)

## Writing tests

- **Pure logic** (formatters, models, calculations): plain `test(...)`, no widgets. Cheapest and
  highest-value — cover every calculation in the Product Bible's ledger.
- **Widgets**: pump inside `MaterialApp/Scaffold`, `pumpAndSettle`, assert via `find.text` /
  `find.byIcon`. For `Text.rich` use `find.textContaining` (not `find.text`). For accessibility,
  `tester.ensureSemantics()` + `find.bySemanticsLabel(...)`.
- Match the existing style; keep tests behaviour-preserving and additive. Adding tests must not
  change goldens.

## Not yet covered (grounded gaps)

- CI **is** configured (`.github/workflows/ci.yml`: lint gates, OpenAPI contract, TS typecheck+test,
  Flutter analyze+test) but runs on a GitHub runner only once the repo is pushed to a GitHub remote —
  today `origin` is a local recovery bundle (`FOUNDER_REVIEW.md` Q7). No integration/e2e harness
  beyond the widget suite. The backend `/v1` surfaces have their own TypeScript tests (see
  `engineering-stack.md`); they are paused during Product Polish.
