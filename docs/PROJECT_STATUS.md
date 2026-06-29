# Project status

The factual handover state for the next session. This is **not** methodology — it is the
current state of the repository. The repository, not any conversation, is the memory.

## Current milestone

**Foundation complete.**

## Current tag

`v0.1-foundation`

## Current product status

- **Membership is in Founder Review** — Founder Decisions being worked one by one.
  - **FD-1 (scope boundary): resolved** — narrow boundary; governing "one concept per spec"
    principle and a mandatory Boundary Contracts section now bind all specs (SPEC-TEMPLATE).
  - **FD-2 (The Promise): form chosen** (Option c); three candidate wordings await Product selection.
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
  - **Open FDs remaining:** FD-8 (lapsed Prospective), FD-9/FD-10 (restoration / dignity removal), FD-11 (women Members),
    FD-12 (eligibility), FD-13 (death). Open Qs: Q1–Q5 (incl. Q4 tenure visibility).
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

**Membership Founder Review.**

## Next engineering sequence (after Membership reaches Engineering Lock)

1. Fastify runtime skeleton.
2. Membership service.
3. Wallet Overview backend.
4. Wallet Overview frontend.

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
