# Changelog

Reverse-chronological, grounded in git history. Dates are commit dates.

## Backend integration hardening (2026-07-04)

The in-authority infra that turns the policy spine into a runnable service.
`services/wallet` 175 → 214 tests, thirteen OpenAPI contracts gated; `nia verify`
green throughout. No locked policy touched, no new dependency, no invented value.

- **Service auth** (`d1f471d`): `SecretServiceAuthenticator` — constant-time
  `X-Nia-Service-Token` verification against Founder/ops-owned secret(s) (rotatable
  set; empty ⇒ deny). The boundary for non-Member callers (rails, jobs, ops).
- **Remittance rail webhooks** (`d1f471d`): `POST /v1/rail/remittances/{id}/{sent,
  recipient-available,settled}` (`openapi.rail.yaml`) — the rail-driven transitions
  the Member API omits, idempotent (webhooks re-deliver), 409 on invalid/escalated.
- **Scheduled SLA sweep** (`7a7dcdf`): `sweepRemittanceSla` + `POST
  /v1/ops/remittance-sla-sweep` (service-authed; external scheduler → HTTP, no
  in-process timer). Idempotent.
- **Savings jobs** (`3eb8039`): `accrueAllSavings` + `settleDueWithdrawals` + ops
  triggers — interest accrual (via the Founder policy seam) and T+n withdrawal
  settlement, both idempotent.
- **Operator reconciliation surface — read-only** (`6df189d`): `GET
  /v1/ops/reconciliation[/{recordId}]` makes the ADR-0015 "never lost" guarantee
  visible. Resolution deliberately NOT built (**OD-8**, `6ee19f2`).
- **Durable stores** (`d7f3af2`): `DurableStore<T>` interface + dependency-free
  `FileDurableStore` (atomic writes, survives restart) + `DurableRemittanceStore`;
  the production adapter is Postgres (ADR-0006) implementing the same interface.
- **Production wiring** (`9050f3e`): `loadWalletConfig(env)` reads every
  Founder/ops value (service secret, recovery cap, savings horizon, Floor seed
  file) with honest-empty defaults; `composeWalletApp` assembles the full service
  over durable stores + the config seams, each route group in its own scope.

**OD-8 opened** (`6ee19f2`): building the Operator surface exposed an uncovered
decision — how the Operator RESOLVES a money conflict (which value wins). ADR-0015
covers detection/queueing, not resolution. Per Step-5, the resolve action stopped
and opened OD-8; the read-only surface shipped.

## Backend R3 arrears recovery — OD-7 ruled + implemented (ADR-0018) (2026-07-04)

OD-7 (arrears recovery ordering), opened during R3 under the Step-5 rule, was **ruled by the Founder**
(Option B) and implemented, **closing the second half of R3 Wage Flow**. `services/wallet` 161 → 175 tests.

- **Governance** (`de4e9bc`): the ruling recorded as [ADR-0018](docs/adr/0018-arrears-recovery-ordering.md);
  ENGINEERING_LOCK OD-7 row set **Locked** with the recorded judgment that the recovery cap stays injected
  config; DECISIONS OD-7 moved Open → Resolved; ADR index updated.
- **Implementation:** the pure `planArrearsRecovery` (`arrears.ts`) encodes the ADR-0018 order — the
  current-cycle waterfall (ADR-0012) runs first and unchanged; only surplus **above the dignity floor**
  recovers prior arrears, **oldest-first**, capped, **Nia's own fee/advance last** (never re-inverting
  OD-1's "Nia last"); partial recovery reduces a record and keeps it `open`, full recovery marks it
  `recovered` with audit provenance (`ArrearsRecord.status` widened `'open' | 'recovered'`;
  `ArrearsLedger.applyRecovery`). The wage settlement runs the recovery pass after allocating, nets it from
  take-home, and returns a `recovery` block (`openapi.wage.yaml`) disclosing the applied cap and per-record
  lines. Money still conserves: `take_home + Σpaid + recovery.total = wage`.
- **The cap is Founder-owned config, never a constant in the algorithm** — `planArrearsRecovery` takes it
  as a parameter; the ruled 50% (5000 bps) is supplied at composition; 0 (recovery off) is the default
  until wired. Reordering recovery, recovering Nia's arrears before the Member's, or dipping into the floor
  require Founder review ([`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md)).

## Backend R8 The Floor — implementation against ADR-0017 (2026-07-04)

R8 built strictly against the locked OD-6 ([ADR-0017](docs/adr/0017-the-floor-authoritative-source.md));
`services/wallet` 144 → 161 tests, nine OpenAPI contracts gated. **The backend policy spine R3–R8 is now
complete**; the one open backend decision is OD-7 (arrears recovery), Founder-gated.

- **R8 The Floor (ADR-0017):** the authoritative, versioned, Founder-owned `the_floor` config behind the
  existing `FloorSource` seam. `the_floor.ts` — the config contents per ADR (baseline dignity floor,
  off-boarding settlement floor, the FD-11 higher floor for women Members, plus server-side per-Member
  overrides) and pure `createInitialFloor`/`reviseFloor`; a revision is a **new** version that supersedes
  the last, never a rewrite. `the_floor_registry.ts` — an **append-only** version registry whose history
  **is** the change-audit trail (publishing rejects any non-monotonic version), and `RegistryFloorSource`,
  the server-side accessor that **implements `FloorSource`** and drops into wage settlement in place of
  `InMemoryFloorSource` (a test proves take-home tracks the registry floor and that a Founder revision
  moves it — no code change). `floor_http.ts` + `openapi.floor.yaml` — read-only `GET /v1/floor` returning
  only the **public** guarantees (per-Member overrides never leak; a test asserts it), default-deny
  401/403, no mutation route (the app cannot change the Floor).
- **No Floor value invented in code** — every paise figure is Founder-provided (production) or an explicit
  test fixture; `RegistryFloorSource` refuses to serve a floor when none is published (a settlement must
  not run floorless). The concrete Founder-owned config-backed store + shared `@nia/floor` lib extraction
  are remaining infra (no OD).

## Backend R7 Savings — implementation against ADR-0016 (2026-07-04)

R7 built strictly against the locked OD-5 ([ADR-0016](docs/adr/0016-savings-withdrawal-mechanics.md));
`services/wallet` 112 → 144 tests, eight OpenAPI contracts gated.

- **R7 Savings (ADR-0016):** withdrawal mechanics (`savings.ts`) — on withdrawal the amount is
  **immediately available in the Wallet** (the withdrawal is returned already `available`, no
  requested-limbo), rail **settlement is T+n** (`settleWithdrawal`, rail-driven, kept off the Member
  API — same principle as remittance confirmation), **interest accrues to the Member net of a single
  disclosed fee** (drawn from net interest first, then principal; money conserved), and there is **no
  early-withdrawal penalty** (available == requested; a locked account is *refused*, never penalised).
  Member-facing endpoints (`openapi.savings.yaml`: read the account with interest accrued-to-now,
  request/list/read withdrawals) in `savings_http.ts`; stores in `savings_ledger.ts`; default-deny
  401/403, owner-only reads (404, no leak), 409 on insufficient balance / locked, server-time header.
- **Recorded judgment (Founder-ratified):** ADR-0016 locks the *behaviour* but not the *numbers*. The
  interest **rate/formula/fee** and the settlement horizon **`n`** are **Founder-owned config** behind
  the `InterestAccrualPolicy` seam (zero default, `NoInterestAccrualPolicy`) and `settleAfterMs` — the
  same pattern as the Floor's values behind `FloorSource`. **No product number is invented in code**; the
  domain enforces only the ownership rule (yield to the Member, net of fee) and refuses a fee exceeding
  interest. Hard-coding a rate or altering the Member-owned-yield principle requires Founder review. Full
  record in [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md).

## Backend R3–R5 — implementation against the locked ODs (2026-07-04)

Backend un-paused after OD-1…OD-6 were ruled + Locked ([`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md),
ADRs 0012–0017). Built strictly against the lock; `services/wallet` 20 → 96 tests.

- **R3 Wage Flow (ADR-0012):** the shortfall waterfall allocator (dignity floor → rent → curry →
  remittance → savings → fee → advance; Nia last; money conserved); `POST /v1/wage/settlements` on an
  injected `FloorSource` seam (the dignity floor is server-side, never client-set — OD-6); and the
  arrears carry-forward record + a **distinct** waiver record (employer-caused fee waiver), reconciling
  to the returned allocation. **Arrears recovery is blocked on OD-7** (opened — see below).
- **R4 Remittance (ADR-0013):** the confirmation state machine — **"sent" is never "confirmed"**;
  confirmed = recipient-available ("Reached home"); 24h SLA → Operator escalation; family ack optional;
  append-only audit by remittance + settlement id. Member-facing endpoint (`openapi.remittance.yaml`:
  initiate + read); rail-driven transitions kept off the Member API.
- **R5 RafiQi (ADR-0014):** scoped/capped/time-bounded/revocable standing authorisation with a
  per-action-confirmation fallback; 24h action reversibility. Member-facing endpoints
  (`openapi.rafiqi.yaml`: grant/revoke/list; list/read/reverse — 409 after the window).
- **R6 Offline (ADR-0015):** per-record-class reconciliation — money
  server-authoritative-with-reconciliation (an offline money write is a proposal; a diverged write goes
  to the Operator queue, **never silently overwritten**), intent last-write-wins, append-only merge;
  `POST /v1/sync` batch endpoint (`openapi.sync.yaml`).
- **OD-7 opened** during R3 (Step-5 guardrail): arrears **recovery** ordering is not covered by ADR-0012,
  so building stopped and opened [`OD-7_ARREARS_RECOVERY_BRIEF.md`](OD-7_ARREARS_RECOVERY_BRIEF.md)
  rather than invent it.

## Engineering-quality loop — verify/CI hygiene (2026-07-04)

- **Doc-link integrity gate** (`7466c65`): `scripts/check-doc-links.mjs` walks every hand-authored
  Markdown file and fails the build on any relative link that doesn't resolve — the governance chain
  (Constitution → ADRs → OD decision book → briefs → `ENGINEERING_LOCK.md` → `ROADMAP.md`) is a web of
  cross-links, so a dead link is silent rot. Generated output is skipped. Fail-closed (catches a planted
  break); 221 links clean. Wired into `scripts/verify.sh` + CI.
- **OpenAPI contract lint via glob** (`3432645`): the contract-lint step listed specs explicitly and had
  drifted — `openapi.sessions.yaml` (a live service contract) was ungated in both the local gate and CI.
  Switched both to `openapi.*.yaml` so every committed spec is gated the moment it lands.
- Non-product, in-authority; `nia verify` green throughout.

## OD decision governance — Founder Decision Book + Engineering Lock (2026-07-04)

- **Founder Decision Book** (`4362bd5`, `65b6501`): `OD_DECISION_BOOK.md` + six one-page briefs
  (`OD-1…OD-6`), each with decision · why · 2–3 options (pros/cons) · recommendation · cost of delay ·
  APIs/data-model/services affected · one-line ruling shortcut. Recommendations run down the repo's own
  law ("the Member wins", "one Floor for everyone"). Grounded in the `services/*` scaffold, the wallet
  ledger categories, and ADR-0004/5/6/7.
- **Decision-profile headers + `ENGINEERING_LOCK.md`** (`36c1e8b`): each brief gains owner · reversible? ·
  latest-safe-date · blocks (4 of 6 are 🔴 hard-to-reverse). The lock is the frozen-decision ledger —
  once a ruling is Locked there, implementation treats it as immutable until a formal Founder revision.
  Governance flow: Book → rulings → Lock → R2–R8 → verify. All rows Pending until the Founder rules.
- Docs/governance only; no code change.

## R9 — SIGNED OFF; motion + typography audits (2026-07-04)

- **R9 sign-off + restructure** (`070945a`): `R9_SIGNOFF.md` closes R9's in-authority scope; R9 recast as
  a **parallel Production Hardening stream** (not the terminal gate) with the three-stream program model
  (Claude/backend · Vercel/design · Founder/OD rulings). Forward path is now backend (R2–R8), all
  Founder-gated.
- **Motion audit** (`703e225`): `R9_MOTION_AUDIT.md`. All motion is one-shot `TweenAnimationBuilder`
  (no controllers/tickers/spinners; goldens safe); per-pillar durations encode the Q8 register. Fixed
  **golden-neutral**: `NiaReveal` + `MovementCheck` now honor `MediaQuery.disableAnimations` (OS Reduce
  Motion), snapping to the final frame. +2 tests (`motion_test.dart`); suite 90 → 92; goldens
  byte-identical.
- **Typography audit** (`703e225`): `R9_TYPOGRAPHY_AUDIT.md`. Family/colour/weight discipline pass; debt
  recorded — the 7-step theme scale is bypassed by ~11 inline `fontSize` values + no `TextScaler` clamp;
  reconciliation repaints frozen screens → gated (Q11).

## R9.4 — accessibility (whole-app, in-authority) (2026-07-04)

- Whole-app accessibility audit ([`R9_ACCESSIBILITY_AUDIT.md`](R9_ACCESSIBILITY_AUDIT.md)). Golden-neutral
  fixes: SOS is a labelled `button`; NiaBook language/month toggles are buttons (language explicitly
  labelled); `Monogram` excluded from semantics; `SectionLabel`s are headers; Profile call button has a
  tooltip. Contrast confirmed WCAG AA. +3 tests (`accessibility_test.dart`); suite 87 → 90; goldens
  byte-identical.
- Gated (FOUNDER_REVIEW Q11): sub-48px tap targets + text-scale reflow on the five frozen screens
  (would move the goldens — needs a Founder-approved screen change).

## R9 matrix + Founder rulings; R9.0 count + R9.5 crash recovery (2026-07-04)

- **Governance:** `REPOSITORY_CONSTITUTION.md` rule 7 — visual prototypes (the Next.js exploration) are
  design references only; Flutter stays canonical (ADR-0002); translating visual ideas needs no
  approval when behaviour is unchanged (**Q10 resolved**). `AUTONOMOUS-LOOP.md` — "finish categories,
  not files." R9 is now a **category matrix** (`ROADMAP.md`).
- **R9.0** — consolidated the restated test count to one canonical home (`PROJECT_STATUS.md` + the
  `NEXT_TASK` verification stamp); peripheral docs de-numbered.
- **R9.5** — crash recovery: `installNiaCrashBoundary()` + calm `NiaErrorScreen` replace Flutter's raw
  error box in release/profile (debug keeps the dev red screen), wired into both entrypoints. +2 tests;
  suite 85 → 87. Goldens byte-identical.

## R9.2 — async state audit: complete state machines (2026-07-04)

- Built [`R9_ASYNC_STATE_AUDIT.md`](R9_ASYNC_STATE_AUDIT.md) — the living inventory of every async
  surface and the states it implements. Encoded the Definition-of-Done rule ("no async widget without a
  complete state machine; no spinner without an exit") in `docs/09_TESTING.md` and the Product Bible.
- Hardened the two remaining gaps: `membership_header` identity (was stuck on `…` forever on failure →
  `NiaAsyncView` error+retry) and `phone_sign_in` (a network failure is now **offline** + Try again,
  distinct from a default-deny → the Operator, keyed on `ApiException`). +3 tests; suite 82 → 85.
  Goldens byte-identical.

## R9 — Production Readiness unlocked; R9.1 error/offline states (2026-07-04)

- **Founder ruling** — become **Production Readiness Lead** when the feature roadmap is gated. Encoded
  the stop condition in `docs/AUTONOMOUS-LOOP.md`; created **R9 — Production Readiness** in `ROADMAP.md`
  (grounded from repository inspection, tagged by authority).
- **R9.1 — live-surface error/offline states.** New `NiaAsyncView` (loading · calm error · Retry)
  replaces the infinite spinner that live `FutureBuilder`s showed on any API failure (airplane mode /
  4xx-5xx / timeout). Wired the money surfaces (home, wallet, my_family) and `profile_page`'s standing;
  `wallet_page`/`my_family_page` simplified to stateless; `membership_header` degrades gracefully by
  design. `async_states_test.dart` (+5); suite 77 → 82. Goldens byte-identical.

## Docs: reconcile state to verified reality (2026-07-04)

- Re-established a Level-A baseline from the repository: `nia verify` green, `flutter analyze` clean,
  **77 tests** across 17 files, no codegen drift, working tree clean, HEAD `d3bd715`.
- Reconciled stale **current-state** docs to that reality — `START_HERE`, `PROJECT_STATUS` (root +
  `docs/12_STATUS`), `KNOWN_BUGS`, `REPOSITORY_INDEX`, `ENGINEERING_AUDIT`, `09_TESTING`,
  `15_SCORECARD`, `AUTONOMOUS-LOOP` scorecard, `08_ROADMAP`, `01_START_HERE`, `16_RISK_REGISTER`.
  Fixed: test counts (49/68/72 → **77**), stale HEADs (`795b0de`/`ec8be4b` → `d3bd715`),
  "board-frozen" present tense (freeze **lifted**, R1 complete; the goldens remain the visual spec),
  E4 (**resolved**, not gated), and the stale "no CI" note (CI is configured — Q7).
- Historical records left intact (SESSION logs, prior CHANGELOG entries, R1-visual-review, the dated
  board handover). Docs only — no code; goldens byte-identical.

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

## R1 complete — Q8 register + Q9 coaching (2026-07-04)

- `536b2a8` **Q8** — per-pillar emotional register via non-colour levers (motion timing + spacing
  density). R1 #3 done; **R1 complete**. Visual review in `docs/design/niabook/R1-visual-review.md`.
- `4cf1fea` **Q9** — Continuity Coaching: one calm next step per screen (R1 #4). `CoachingLine`.
- `e143c1b` **Philosophy** — progress product, not engagement product.

## R1 #1 + E4 (2026-07-04)

- **R1 #1** — Living's middle carries "spend less": each service row now reads *Included* (blue),
  echoing the utilities; the whole screen says "inside your ₹2,400, nothing extra." Living golden
  updated. R1 #3/#4 paused as founder decisions (`FOUNDER_REVIEW.md` Q8–Q9).
- `888a1d4` **E4** — deduped the SOS control (NiaBook uses shared `niaSosButton`; goldens
  unchanged). Icon-chip kept separate by design.

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
