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
- **No backend runtime built yet.**
- **No production feature built yet.**

## Current blocker

**None blocking.** Membership is Engineering-Locked; the bottleneck is now **Engineering, not
Product**. Implementation may begin with the Fastify runtime skeleton. (Carried, non-blocking:
FD-2 exact Promise headline; FD-10/FD-13 flows pending legal review.)

## Next engineering sequence (Membership is Engineering-Locked — sequence is now unblocked)

1. **Fastify runtime skeleton** — boots, health route, wired into `verify`, uses `packages/log`.
   *First sub-step:* provision Fastify into the offline cache deliberately (the kit installs
   offline; adding a dep is its own engineering-stack step — do not assume network).
2. **Membership service** — identity + lifecycle state machine (Prospective→Member→Paused→Closed),
   per spec §5/§13.
3. **Wallet Overview backend** — read-only money story + legibility requirements (spec §3).
4. **Wallet Overview frontend** — wire the prototype Wallet to the locked contract.

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
