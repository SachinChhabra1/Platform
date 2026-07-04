# Project status

The factual handover state for the next session. This is **not** methodology — it is the
current state of the repository. The repository, not any conversation, is the memory.

## Current phase — Product Polish (frontend); board freeze lifted, R1 complete

**Current state (2026-07-04):** the board freeze is lifted, R1 (the craftsmanship
backlog) is complete, and the suite is at **92 tests** — `nia verify` green, `flutter analyze`
clean, no codegen drift, goldens deterministic. **R9 — Production Hardening is ✅ SIGNED OFF**
(2026-07-04, [`../R9_SIGNOFF.md`](../R9_SIGNOFF.md)): in-authority scope complete, residual items gated
(native build R2/K1, or a Founder-approved frozen-screen change Q11). R9 is now a **parallel** hardening
stream, not the terminal gate. **OD-1…OD-6 were ruled + Locked (2026-07-04)** and the backend un-paused;
implementation is underway strictly against the lock: **R3 Wage** (allocator · endpoint · arrears+waiver),
**R4 Remittance**, **R5 RafiQi**, **R6 Offline** (per-record-class reconciliation), **R7 Savings**
(withdrawal mechanics: instant-to-Wallet, T+n settle, interest to the Member net of a disclosed fee, no
early-withdrawal penalty), and **R8 The Floor** (the versioned, Founder-owned, audited `the_floor` config
behind the `FloorSource` seam: append-only version history = audit trail; `RegistryFloorSource` plugged
into wage settlement; read-only `GET /v1/floor` exposing only the public guarantees) — domains + endpoints
all done (`services/wallet` 20 → 175 tests, nine OpenAPI contracts gated). **The backend policy spine
R3–R8 is complete, and OD-7 (arrears recovery) is now ruled + built — R3 Wage Flow is fully closed
(both halves).** OD-7 was opened during R3 (Step-5 guardrail), ruled Option B on 2026-07-04
([ADR-0018](../docs/adr/0018-arrears-recovery-ordering.md)), and implemented: current-cycle waterfall
first, then surplus-above-floor recovers arrears oldest-first, capped (Founder config, 50%), Nia last.
**Integration hardening is done** (`services/wallet` 20 → 214 tests): service auth, the remittance rail
webhook adapter, the scheduled SLA sweep, savings accrual + settlement jobs, the read-only Operator
reconciliation surface, the durable-store primitive (`FileDurableStore`) + a durable `RemittanceStore`,
and the production config loader + `composeWalletApp` (every Founder value read from the environment, none
invented). **OD-8 is ruled + built** — opened during hardening (Step-5), ruled Option B on 2026-07-04
([ADR-0019](../docs/adr/0019-operator-conflict-resolution.md)): the Operator resolves each money conflict
as accept-proposal / keep-server / manual, every resolution an authoritative ledger write recording the
operator + reason, operators on a per-operator credential. **No backend product decision is open.** All
un-ruled numbers (savings interest rate/fee + horizon `n`; the concrete Floor values; the recovery cap) and
credentials (service, operator) are Founder/ops-owned config behind seams — read from the environment, none
invented (recorded judgments in [`../ENGINEERING_LOCK.md`](../ENGINEERING_LOCK.md)). `services/wallet` at
224 tests. Next: extend the durable-store pattern to the remaining ports (Postgres online); RafiQi
orchestrator auto-take/compensation. R2/native untouched (separate Founder go-ahead). *(Earlier: the R9 engineering-quality loop ran and was exhausted before the OD
rulings reopened backend coding.)* Founder-gated remainders: R2 native, Q11 frozen-screen change, OD-7.
*Historical framing of the pre-ruling bottleneck (OD-1 critical, expired
2026-07-13). Detail below and in [`../NEXT_TASK.md`](../NEXT_TASK.md).

**Board baseline: Product Polish was COMPLETE for the board (baseline `795b0de`, 2026-07-01).** After M1
(backend vertical slice) the work moved to the Member app's experience. All five screens of
the operating system were rebuilt to App-Store quality on a shared component set
(`apps/member/lib/features/pillars/nia_components.dart`) and integrated into the shell:

- **NiaBook** (Truth · the home ledger, opens first) · **Work** (Hope) · **Living** (Relief)
  · **Store** (Satisfaction) · **Family** (Purpose). Each pillar ends on its own emotion — a
  product law now recorded in [`PRODUCT_ARCHITECTURE.md`](../PRODUCT_ARCHITECTURE.md).
- **Integration verified:** NiaBook opens first; nav order NiaBook · Work · Living · Store ·
  Family; pillars on the shared components; every pillar closes into NiaBook; no wallet
  language in the integrated surface; SOS + NiaBook chrome (month/language/identity/Studio)
  consistent; all five goldens regenerate byte-identical.
- **Verification (board baseline `795b0de`):** `nia verify` green · `flutter analyze` clean · 49
  tests pass · no codegen drift. Recovery bundle `nia-final-integration-20260701-164454.bundle`
  (verified). *(R1 later completed at 77 tests, HEAD `d3bd715`; the **live** count is the current-state
  line at the top of this doc — canonical per R9.0.)*
- **State:** board freeze lifted; **R1 (the craftsmanship backlog) is COMPLETE (2026-07-04).**
  All four items: ○→✓ motion visible (R1a); Living middle reads "Included" (spend less); per-pillar
  emotional register via non-colour levers — motion timing + density (Q8); Continuity Coaching —
  one calm next step per screen (Q9). Plus E4 (SOS dedup) and the **progress-not-engagement** law
  (`PRODUCT_ARCHITECTURE.md`). Before/after in `design/niabook/R1-visual-review.md`. R1 finished green
  (77 tests at the time; the live count is the top line). Next work is Founder-gated — see
  [`../NEXT_TASK.md`](../NEXT_TASK.md).
- **Demo:** the offline board build (`apps/member/lib/main.dart`) runs as a web app; a live
  demo is served locally + via a temporary tunnel (see `~/Desktop/nia-board-demo/OPEN-ME.md`).
  There is no native iOS/Android build — web only.

The backend remains **paused** during Product Polish (no money-movement flows built). M1
below is the last backend milestone and remains valid.

## Backend milestone (paused)

**Milestone M1 — COMPLETE (2026-06-30).** The first end-to-end vertical slice is built and
validated: the Wallet Overview (read model → OpenAPI contract → HTTP surface → generated Dart
client → Flutter screen rendering the two distinct §3 figures) plus a read-only Membership HTTP
surface. Validated from a clean bundle restore: offline reinstall, full verify green, both HTTP
services launched, and the Wallet screen rendered from data fetched over HTTP through the generated
client (available ₹3,480 ≠ stayed ₹4,800), with no PrototypeData supplying those values. See the
M1 evidence in SESSION-HANDOVER.md.

Previous milestone: Membership specification Engineering-Locked (2026-06-29).

## Current tag

`v0.2-m1` (M1 complete) · `v0.1-foundation` (foundation)

## Current product status

- **Membership is Engineering-Locked (2026-06-29, spec rev 5).** All FDs resolved; Q1–Q5 resolved.
  Founder Review complete. Carried items (non-blocking for backend): FD-2 exact Promise headline
  (anchor/structure locked; Founder to supply final sentence); FD-10/FD-13 flows need legal review
  before *those* flows are built.
  - **FD-1 (scope boundary): resolved** — narrow boundary; governing "one concept per spec"
    principle and a mandatory Boundary Contracts section now bind all specs (SPEC-TEMPLATE).
  - **FD-2 (The Promise): resolved** (Founder, 2026-06-29) — anchor C-1 (protection of money);
    "your money is yours" retired as flat; headline now "what you earn is protected — every rupee"
    (Founder-directed, AI-drafted; exact phrasing pending Founder ratification).
  - **FD-3 (when tenure begins): resolved** — first Saturday after move-in (one birthday: Prospective→Member,
    Membership, and tenure begin together). Two clocks recorded: Member-facing Relationship Tenure vs
    internal Analytics Tenure (never exposed as tenure). Q4 (whether tenure is shown) stays open — no tenure surfaced.
  - **FD-4 (pause reasons): resolved** — Paused preserves continuity; entered on genuine intent to return;
    reason is metadata, not state; Operator authority (Art. XVIII). State machine stays Prospective→Member→Paused→Closed.
  - **FD-5 (tenure while paused / max pause): resolved** — tenure continues while Paused (resets only after Closed);
    max-pause is operational policy, not in the spec. New governing principle: no operational parameters in product specs.
  - **FD-6 (return within 90 days): resolved** — tenure resets on return (new birthday); history preserved;
    90-day record is for dignity, not tenure; re-entry experience belongs to Onboarding.
  - **FD-7 (consent): resolved** — consent is an event, not a setting: per-request, default no, explicit, named,
    revocable. Reflected in the build (Profile: "You decide every time").
  - **Founder Review session (2026-06-29, spec rev 5):**
    - **FD-11 (women Members): resolved** — full concrete floor (secured women-only living, woman
      contact one tap, stricter data default, no male staff entry, independent grievance path);
      to be validated with women Members + counsel.
    - **FD-12 (eligibility): resolved** — rule-bounded Operator judgment (legal minimums +
      non-discrimination floor; Operator judgment within).
    - **FD-13 (death): resolved** — nominee-based, Operator-assisted settlement; nominee captured
      at onboarding; legal review required before implementation.
    - **FD-8 / FD-9 / FD-10: resolved** (Founder-confirmed) — lapsed-record handling; restoration as
      a human process; dignity-based removal due process (FD-10 flow needs legal review before build).
    - **Q1–Q5: resolved** in the Product seat, Nia-OS-grounded (Founder to ratify): Operator-mediated
      creation; only *Paused* surfaced; Member-only My Family; tenure internal; Operator-initiated
      restoration outreach.
  - **Gate to Engineering Lock: CLEARED (2026-06-29).** FD-8/9/10 confirmed; canonical name = **RafiQi**
    (repo spelling kept; Nia-context "Rafiki" is the stale entry). FD-2 exact headline is the only
    carried Founder copy-item; it does not block backend implementation.
- **No Product Specification is Engineering-Locked yet.**
- A **Product Review Prototype** now runs in `apps/member` (Founder-authorised; methodology.md
  → Product Review Prototypes). Visual shell only — no backend/behaviour; evolves as FDs resolve.
  - **Iteration 1: verified & Founder-accepted** (2026-06-29) — six screens + navigation GIF
    captured, live build, verify green. Recorded in [`product-review-log.md`](product/product-review-log.md).
  - **Iteration 2: Founder-accepted** (2026-06-29) — calmer surface, quiet chip + CTA, lifted Promise.
  - **Iteration 3: delivered, awaiting Founder review** (2026-06-29) — Home order fixed (balance
    leads, Promise 4th); "Your life" reads as a journey; Wallet is a money story; `MoneyRow`
    removed. Verify green; all FD/Q markers preserved. See the review log.

## Current engineering status

- Repository foundation: **complete**.
- Local verification (`pnpm run verify`): **complete**.
- CI verification: **complete**.
- API contract foundation (`packages/types`, OpenAPI base): **complete**.
- Member Flutter shell (`apps/member`): **complete**.
- i18n foundation (`packages/i18n`): **complete**.
- Logging / PII redaction (`packages/log`): **complete**.
- Fastify: **approved** as the backend implementation choice; recorded in
  [`docs/engineering-stack.md`](engineering-stack.md) (not an ADR).
- **Fastify runtime skeleton (`packages/runtime`, `@nia/runtime`): complete (2026-06-29).**
  Boots, `/health` route, request logging through `@nia/log` (PII redaction); wired into
  `pnpm run verify` (Vitest + typecheck) and CI via the pnpm workspace. Runtime only — no
  product behaviour. `tsx` provisioned as the ESM-TS service runner; `fastify` provisioned
  into the offline cache and re-bundled in `backups/`. Verify green.
- **Membership service (`services/membership`, `@nia/membership`): domain core complete
  (2026-06-29).** The lifecycle state machine (Prospective → Member → Paused → Closed) +
  identity, behind a `MembershipRepository` port with an in-memory adapter. Pure and fully
  unit-tested (13 tests): legal + illegal transitions; tenure begins at the birthday (FD-3),
  continues through Paused (FD-5), stays internal (Q4); pause reason + closure cause as opaque
  metadata (FD-4). **No FD-10 (removal) or FD-13 (death) flow** (legal review pending); no HTTP,
  logging, or persistence engine yet. Spec §14 step 2. Verify green.
- **Wallet Overview backend (`services/wallet`, `@nia/wallet`): read model complete
  (2026-06-29).** The first Member-visible production slice (ADR-0008). A pure read-only
  projection (10 tests): `WalletActivity` log → `MonthlyOverview` with two **distinct** figures
  — `availableBalance` (usable now) vs `stayedThisMonth` (what stayed his this month) — a
  neutral shame-free money story (no severity/alarm field), and reachable prior months
  (`availableMonths`). Honours spec §3 legibility. **No** money movement, ledger engine,
  lending/credit/deductions/settlement policy, or FD-10/FD-13. Money in integer paise;
  formatting is i18n's job. Spec §14 step 3. Verify green. *Carried for Product confirmation:
  the exact arithmetic of "stayed with you this month" (driven by a data-provided
  `changesHoldings` flag; the spec mandates distinctness, not the formula).*
- **Read-only HTTP surfaces exist** for Wallet (`GET /v1/wallet/overview[/months]`) and
  Membership (`GET /v1/membership/me`), both over `@nia/runtime` with a bearer PRE-AUTH stub.
  **No persistence engine yet** (in-memory adapters); no write/command surfaces.

## Current blocker

**None blocking.** Membership is Engineering-Locked; the bottleneck is now **Engineering, not
Product**. Steps 1–4 are built (Fastify runtime skeleton, Membership domain core, Wallet
Overview read model, and now the **Wallet Overview frontend** — contract, HTTP surface,
generated clients, and the Flutter Wallet rendering the two distinct §3 figures). Next is the
first follow-on slice (see below). (Carried, non-blocking: FD-2 exact Promise headline;
FD-10/FD-13 flows pending legal review; **"stayed with you" arithmetic still to confirm at the
next Wallet Product Review** — the read model's interpretation is unchanged.)

## Next engineering sequence (Membership is Engineering-Locked — sequence is now unblocked)

1. ~~**Fastify runtime skeleton**~~ — **DONE (2026-06-29, `packages/runtime`).** Boots,
   `/v1/health` (under the contract's `API_PREFIX`), wired into `verify` (Vitest + typecheck)
   and CI, logs through `@nia/log`.
   Fastify + tsx provisioned into the offline cache and re-bundled.
2. ~~**Membership service**~~ — **DONE (2026-06-29, `services/membership`).** Domain core:
   the lifecycle state machine (Prospective→Member→Paused→Closed) + identity, behind a
   `MembershipRepository` port (in-memory adapter); reason/cause as metadata (FD-4); tenure
   internal (FD-3, Q4). FD-10/FD-13 flows **not** built (legal review pending). Pure, 13 tests,
   no HTTP/persistence yet.
3. ~~**Wallet Overview backend**~~ — **DONE (2026-06-29, `services/wallet`).** Pure read-only
   read model: `WalletActivity` → `MonthlyOverview`; `availableBalance` distinct from
   `stayedThisMonth`; shame-free money story; reachable prior months (spec §3; ADR-0008).
   No money movement, ledger engine, policy, or FD-10/FD-13. 10 tests.
4. ~~**Wallet Overview frontend**~~ — **DONE (2026-06-30, §14 step 4, four slices).** Contract
   (`openapi.wallet.yaml`) → HTTP surface (`services/wallet/src/http.ts` over `@nia/runtime`) →
   generated clients (`scripts/codegen.sh`, committed `nia_api`) → Flutter wiring (`apps/member`
   renders a `MonthlyOverview`, two distinct §3 figures). See `engineering-stack.md` for the
   per-slice detail and the codegen/JDK notes. 60 tests total; verify green.

5. ~~**Membership HTTP surface**~~ — **DONE (2026-06-30).** Read-only `GET /v1/membership/me`
   over `@nia/runtime` (`services/membership/src/http.ts`), contract `openapi.membership.yaml`.
   Returns identity + canonical lifecycle state only — **no tenure** (FD-3, Q4) and no
   operational metadata; bearer PRE-AUTH stub, default-deny → 401, no Membership → 404.
   17 tests (13 domain + 4 HTTP); client generation deferred (no Flutter consumer yet).

6. ~~**Serve the contract under `/v1`**~~ — **DONE (2026-06-30).** Every route now mounts under
   the contract's version prefix (`servers: /v1`): a single `API_PREFIX` in `@nia/runtime` drives
   `/v1/health` and both feature surfaces (`/v1/wallet/overview[/months]`, `/v1/membership/me`);
   the Flutter `Api*Source` clients target `…/v1`. Closes the known gap where the services served
   unversioned paths and only interoperated because the client dropped `/v1`. Route tests updated;
   verify green; smoke-tested (old unversioned paths now 404).

7. ~~**Live app configuration**~~ — **DONE (2026-06-30).** A single composition seam,
   `MemberConfig` (`apps/member/lib/config/member_config.dart`), selects the live HTTP
   `Api*Source` over the offline `Sample*Source` from compile-time config (`--dart-define`
   `NIA_API_BASE_URL` + `NIA_MEMBER_TOKEN`). Empty URL ⇒ offline sample (the Product Review
   Prototype default, unchanged); a configured URL ⇒ the app reads the live `/v1` surfaces via the
   generated `nia_api` client. Threaded `NiaMemberApp → MemberShell → WalletPage / ProfilePage →
   MembershipHeader`. **Both modes proven by tests:** 3 selection guards + 4 render/fetch tests
   (`app_modes_test.dart`) — offline renders the sample; live makes a REAL loopback HTTP fetch
   through the generated client, asserts it hit `/v1/wallet/overview` + `/v1/membership/me` with the
   bearer, and renders the fetched figures. Also smoke-tested against the real Fastify services.
   Verify green. **Auth still the bearer PRE-AUTH stub.**

8. ~~**Session/auth boundary (engineering only)**~~ — **DONE (2026-06-30).** Retired the
   `bearer = membership-id` PRE-AUTH stub on both surfaces. A real indirection now lives in
   `@nia/runtime` (`session.ts`): a `SessionStore` port + `InMemorySessionStore` + `memberFromSession`
   resolve an OPAQUE token, server-side, to the bound Member (with device id, Book VIII §1.3);
   default-deny. Both services take a `sessions` dep and seed a demo session (`sess-ramesh-001` →
   `m-001`); presenting the membership id now 401s. **Scope: engineering boundary only** — the
   phone-verification / issuance flow is NOT built (unspec'd; §13/6 device re-establishment open).
   Tests: `session.test.ts` (5) + per-service unknown-token → 401 guards. Verify green; smoke-tested
   live (valid session 200, old `m-001` 401). App unchanged in code; `NIA_MEMBER_TOKEN` is now a
   session token.

9. ~~**Spec 0002 (Member Session & Recovery) Engineering-Locked + implementation plan**~~ —
   **DONE (2026-06-30).** The session issuance/recovery spec is locked (FD-S1–S8, ERR-1–8) with a
   per-slice implementation plan (`docs/plans/0002-session-issuance-recovery-implementation-plan.md`).
   No code in that commit — the gate that previously blocked issuance is cleared.

10. ~~**Slice A — session model: scope + revocation**~~ — **DONE (2026-06-30, plan 0002 §5).** Pure
    `@nia/runtime` (no contract, no new route). `Session` gains `scope` (`pre_membership`|`member`,
    FD-S8/ERR-1); `SessionStore` gains `issue(session)→token` (with one-active-device revoke-prior,
    FD-S3) and `revoke(token)`; `InMemorySessionStore` is mutable (injectable token factory).
    `sessionFromRequest` added; `memberFromSession` unchanged (now a projection). Both services 403
    a `pre_membership` session before any record lookup (FD-S8). Tests: runtime issue/revoke +
    scope + revoke-prior + isolation; per-service `pre_membership`→403. Verify green; no drift.

11. ~~**Developer Preview ("see it")**~~ — **DONE (2026-06-30).** The Member app now runs as a
    product against the real services in one command. `services/preview` (`@nia/preview`) composes
    the Wallet + Membership surfaces onto ONE origin (8080) with one seeded session (the app reads a
    single base URL). Home is live (greeting + the two §3 figures + standing); Profile gains phone,
    a recovery link, and sign-out; a new Recovery screen mocks spec 0002's in-person rebind.
    `apps/member/lib/main_preview.dart` + `nia preview` launch it. 5 preview-backend tests + member
    suite 24; verify green, no drift. **Founder direction this session: shift to "can I see it?" —
    priority order Preview → Live Home → Membership UI → Session issuance → Family.**

12. ~~**Membership UI depth (Q2 resolved)**~~ — **DONE (2026-06-30).** Founder resolved **Q2**: show
    the lifecycle state, but only as it helps action — calm for Active, careful/dignified for
    Paused/Closed (continuity + Operator). `MemberStanding` widget; Home + Profile show the live
    standing in both modes (the Q2/FD-5 "open" placeholders retired); the preview backend seeds
    paused (Sunita) + closed (Imran) Members so every standing is walkable (`sess-paused` /
    `sess-closed`). Founder also kept **Phone** as preview copy (not on the contract) and **Recovery**
    as a copy mock — so app-only, no codegen. Member suite 28; preview backend 6; verify green.

13. ~~**My Family view (Q3 resolved)**~~ — **DONE (2026-07-01).** Founder priority ⑤. Q3 resolved:
    My Family is a **Member-only view the Member controls** ([A4]) — family is part of the Member
    ([A1]); a family-facing surface is FE-2 (deferred). `MyFamilyPage` shows the family member and
    the money reaching them **summed live from the Wallet remittance lines**, with a "yours alone"
    note; Home's "Your family" row opens it and the Q3 marker is retired. App-only, no codegen.
    Member suite 31; verify green.

14. ~~**Slice B — session issuance + phone sign-in**~~ — **DONE (2026-07-01).** `POST /v1/sessions`
    (`openapi.sessions.yaml` + codegen): phone-first re-proof issues an opaque, device-bound token
    (spec 0002 FD-S1). `@nia/sessions` — a phone→member directory (the verification seam; OTP is a
    later, spec-gated step) → `SessionStore.issue` (new device revokes the prior, FD-S3),
    default-deny on an unrecognised phone, idempotent. Wired into the composed preview (shares its
    store; seeds the demo phones; clock pinned to the June scenario). App: `ApiSessionSource` +
    `PhoneSignInPage`; `main_preview` opens on Phone → Session → app. The Founder's whole chain now
    runs end to end. Sessions 5, preview 7, member 33; verify green, no codegen drift.

    *Next (plan 0002): **Slice C** — sign-out `DELETE /v1/sessions/current` (ERR-8; makes the Profile
    button real) → **Slice D** — operator recovery rebind (FD-S2/ERR-2; needs a minimal ops
    credential, D1 — the critical path; makes the Recovery screen real) → **E** (Closed force-end,
    ERR-7) → **F** (app wiring). Separately: **verification strength (OTP)** needs a Founder/Product
    spec (Book VIII §1.3). App-only polish available: Wallet money-story treatment; Paused→resume.
    Not blocked: Membership write/command surface; PostgreSQL adapters (ADR-0006); Wallet ledger.*

15. ~~**Icon-first bottom navigation**~~ — **DONE (2026-07-01).** UI-only (no backend/contract/codegen).
    `NiaBottomNav`: icon-first tabs — selected = solid icon + short label in near-black ink,
    unselected = quiet grey line icon (Book III monochrome; built-in Material icons, no new packages).
    The bar is now **Home · NiaBook · Family · Me** — Family and Me promoted from pushed routes to
    tabs; Clusters/RafiQi (prototype-only) dropped from the bar (still four anchors, §3.2).
    `MyFamilyPage`/`ProfilePage` made body-only under the shell app bar; all live wiring preserved.
    `bottom_nav_test` added; member suite 37; verify + render green. (Tab labels finished at
    `11d577c`: Wallet→NiaBook, Profile→Me — labels only; screens unchanged.)

    **▶ PRODUCT POLISH PHASE (Founder, 2026-07-01): backend + infrastructure PAUSED.** Next task is
    the **NiaBook redesign — DESIGN-ONLY** (no code): turn the Wallet into NiaBook, which answers "was
    leaving home worth it this month?" (not a wallet/ledger). Deliver IA, wireframe, hi-fi mockup,
    full copy, rationale, and five state cases (Sukh Store savings; unused ₹500 work voucher; redeemed
    voucher; zero savings; Member who didn't get work through Nia). The Sukh Store savings + Work
    voucher are first-class (the Nia flywheel). Await Founder approval before Flutter. Session-issuance
    plan 0002 (Slice C sign-out → D recovery → E → F) is paused until platform work resumes.

Full plan and Engineering Readiness Review: spec §14
([`0001-membership-strawman-spec.md`](product/0001-membership-strawman-spec.md)).

## Verification command

```bash
pnpm run verify
```

## Rules for the next session

The next Claude session must (understand the project first, then how to operate):

1. Read [`docs/SESSION-START.md`](SESSION-START.md).
2. Read this file (`docs/PROJECT_STATUS.md`).
3. Read the ADR index ([`docs/adr/README.md`](adr/README.md)).
4. Read the Product Specification register ([`docs/product/README.md`](product/README.md)).
5. Read the Membership Product Specification
   ([`docs/product/0001-membership-strawman-spec.md`](product/0001-membership-strawman-spec.md)).
6. Read [`docs/engineering-stack.md`](engineering-stack.md) (if relevant to the work).
7. Read [`docs/CHARTER.md`](CHARTER.md) — the authoritative Operating Charter (governs
   behaviour; read after understanding the project).
8. Run `pnpm run verify` and confirm green.
9. Produce a short understanding report.
10. Continue per the Charter (just-in-time Founder Decisions; Product-Review-driven).
