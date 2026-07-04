# Changelog

Reverse-chronological, grounded in git history. Dates are commit dates.

## Product Polish phase — Member app to App-Store quality (2026-06-30 → 2026-07-01)

- `795b0de` Board handover: record final integration commit + bundle
- `375f7ae` **Final integration** — five hardened screens wired into the shell, verified
  (NiaBook opens first; nav order correct; every pillar closes into NiaBook; no wallet
  language; goldens byte-identical). Bundle `nia-final-integration-20260701-164454`.
- `24276a3` Board handover: Family hardened
- `0301825` **Family** to App-Store quality — the emotional centre: care, not remittance.
  Promise "Send more home" → "Take better care of home"; people first, money second;
  cross-pillar goal (Work/Store cover a school fee); closes on Purpose. Added the
  five-emotion product law to `PRODUCT_ARCHITECTURE.md`.
- `77588f1` Board handover: Store hardened
- `ba6b60d` **Store** — harden the flywheel, not the shop. Money-first hero (voucher);
  every SKU answers "how much did I keep?"; compounding ladder (today ₹63 → month ₹185 →
  year ₹2,460); literal NiaBook close. Fixed data incoherence (today vs month; basket sum).
- `18be4f6` Board handover: Work hardened
- `d636110` **Work** — shared components + benefit copy + economic chain (certification →
  +₹2,000 wages → +₹500 Sukh voucher → more savings → NiaBook). +₹2,500/mo hero.
- `017797b` Board handover: Living hardened; component set + next screens
- `6ff1fe8` **Living** — reusable components + benefit copy + motion (first screen hardened;
  established `nia_components.dart` + `NiaReveal`).
- `c9b7e20` Terminology: Nest, not room (Nest → Coach → Studio → Theatre)
- `cacf5b8` Product laws: the emotional contract + the feature intake test
- `2ca9daa` Board handover: full operating system (five screens) + canonical docs
- `39899f4` Pillars to production: Work · Living · Store · Family + design lock

## Backend — Milestone M1 (2026-06-30)

- First end-to-end vertical slice: Wallet Overview (read model → OpenAPI → HTTP → generated
  Dart client → Flutter screen) + read-only Membership surface. Tag `v0.2-m1`. Backend then
  paused for Product Polish. Detail in `docs/PROJECT_STATUS.md`.

## R1a — the ○→✓ motion (freeze lifted, 2026-07-04)

- **R1a** — board freeze lifted; started the craftsmanship backlog. Added `MovementCheck` and made
  NiaBook's signature waiting→true motion visible on load (the "unlocked" tally + each became-true
  line, staggered). No copy/layout change; goldens byte-identical. Suite 72 → 75.

## Continuous loop — audit inputs + coverage (2026-07-04)

- **E6** — `test/common_test.dart`: 4 tests for `widgets/common.dart` (Monogram, SectionLabel,
  prototypeNoOp, SOS→Operator sheet). Suite 68 → 72. Goldens byte-identical.
- `a62830a` **REPOSITORY_INDEX + ENGINEERING_AUDIT** — grounded in the real monorepo; resolves
  the drift where the loop referenced non-existent orientation files.

## Engineering OS v1.0 — final governance (2026-07-04)

- `REPOSITORY_CONSTITUTION.md` — source-of-truth hierarchy (intent vs. reality axes) + tie-break rule.
- `FOUNDER_REVIEW.md` — the Founder questions queue, seeded with the six real open questions.
- Orientation exit checklist added to `docs/01_START_HERE.md`; v1.0 stabilization directive
  recorded in `AUTONOMOUS-LOOP.md` (operate within the system; don't redesign it; ship NiaBook).
- Governance is now frozen at v1.0. Last framework change; the loop runs the product next.

## Operating manual grounded in the real repo (2026-07-04)

- **Product Bible (03)** — regenerated from repository mining: implementation map (real widgets),
  state/nav/i18n/RafiQi with ADR references, five screen chapters, legacy surfaces, calculation
  ledger, and `FOUNDER REVIEW` markers. The one book written from scratch.
- `eda64e0` **00–17 navigation layer** — short `START_HERE` + Orientation Mode + `02_MANUAL`
  index + thin index docs pointing to the real canon (never restating ADRs). MANUAL→02,
  PRODUCT_BIBLE→03, TESTING→09.
- Reconciliation: the package is a **governance reference only**; its structure was adopted, its
  empty-workspace/wrong-product content discarded. The real repo remains the single source of
  truth.

## Engineering quality — autonomous loop (2026-07-01)

- **E5** — `test/niabook_scenario_test.dart`: 8 tests for `formatPaise` (Indian ₹
  grouping/sign/rounding) + `NiaBookMonth.sample` invariants. 60 → 68.
- `bb2bfa0` **Governance (ratified + frozen)** — Engineering Director charter, governance
  freeze, 70/15/10/5 budget, regression budget, Council-every-10 + Scorecard.
- `4bc0e0b` **E2** — `test/nia_components_test.dart`: 11 tests for the shared component
  surface (InfoCard/ListRow/SummaryCard/SectionHeader/OpportunityCard/NiaReveal). 49 → 60.
- `70b84e0` **E1** — removed dead helpers from `pillar_kit.dart` (niaCard, niaListRow,
  niaBookStrip, sectionTitle; zero callers). Goldens byte-identical.
- `411dd95` **Loop governance** — `docs/AUTONOMOUS-LOOP.md` (the "when roadmap blocked"
  ladder + Engineering Authority); ROADMAP gains an unlocked engineering-quality lane.

## Docs / loop scaffolding (2026-07-01)

- Reconciled `docs/PROJECT_STATUS.md` to the Product Polish phase; established `ROADMAP.md`,
  `KNOWN_BUGS.md`, `NEXT_TASK.md`, `SESSION.md`, `CHANGELOG.md` so autonomous sessions run
  from the repository, not conversation history.
