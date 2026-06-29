# Project status

The factual handover state for the next session. This is **not** methodology — it is the
current state of the repository. The repository, not any conversation, is the memory.

## Current milestone

**Membership specification Engineering-Locked (2026-06-29).** Implementation may begin.

## Current tag

`v0.1-foundation`

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
- **No HTTP surface / persistence engine built yet** (read models + domain only).

## Current blocker

**None blocking.** Membership is Engineering-Locked; the bottleneck is now **Engineering, not
Product**. Steps 1–3 are built (Fastify runtime skeleton, Membership domain core, Wallet
Overview read model); next is the **Wallet Overview frontend (step 4)** — wiring the prototype
Wallet to the read model. (Carried, non-blocking: FD-2 exact Promise headline; FD-10/FD-13
flows pending legal review; "stayed with you" arithmetic to confirm at the next Wallet Product
Review.)

## Next engineering sequence (Membership is Engineering-Locked — sequence is now unblocked)

1. ~~**Fastify runtime skeleton**~~ — **DONE (2026-06-29, `packages/runtime`).** Boots,
   `/health`, wired into `verify` (Vitest + typecheck) and CI, logs through `@nia/log`.
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
4. **Wallet Overview frontend** ← **next** — wire the prototype Wallet (`apps/member`) to the
   read model; replace placeholder data; render the two distinct figures (§3 legibility note).

   *Follow-on slices (not yet sequenced): HTTP/API surface for the read model (via
   `@nia/runtime`); Membership HTTP wiring; PostgreSQL adapters (ADR-0006); Wallet ledger
   event store (senior review); return-after-closure (FD-6) at the Onboarding boundary.*

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
