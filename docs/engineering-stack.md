# Engineering stack

The implementation choices Nia builds with — frameworks, tools, and libraries. These are
**not** governance. They are recorded here so the choice is discoverable without
ceremony.

**ADRs vs. this document.** Architectural decisions — hard to reverse, long-term, or
materially changing how Nia is built — live in [`docs/adr/`](adr/). Routine engineering
implementation choices live here. Keep ADRs rare so they stay valuable. Where a choice has
an ADR (because it is architectural), it is linked below; where it does not, it is recorded
inline.

## Stack

| Area | Choice | Recorded |
|------|--------|----------|
| Backend language | TypeScript (Node 20 LTS) | [ADR-0005](adr/0005-backend-typescript.md) |
| Backend HTTP framework | **Fastify** (runtime skeleton built 2026-06-29: `packages/runtime`) | here · `packages/runtime` |
| TS service runner | **tsx** (runs ESM TypeScript entrypoints on Node 20) | here |
| Database | PostgreSQL | [ADR-0006](adr/0006-database-postgresql.md) |
| API contract | OpenAPI, generated Dart + TS clients | [ADR-0007](adr/0007-openapi-generated-clients.md) |
| Clients | Flutter (member, operator); web (console) | [ADR-0002](adr/0002-flutter-apps-web-console.md) |
| Design system | shared tokens + Flutter + web | [ADR-0003](adr/0003-split-design-system-shared-tokens.md) |
| Localization | ARB + gen-l10n in `packages/i18n` | [ADR-0010](adr/0010-i18n-architecture.md) |
| Logging | `@nia/log` (structured + PII redaction) | `packages/log` |
| TS test runner | Vitest; `flutter test` for Dart | [ADR-0011](adr/0011-typescript-testing-and-shared-libs.md) |
| Package manager / CI | pnpm workspaces; GitHub Actions | here |

## Local toolchain

Installed under `~/.nia-toolchain`, on `PATH` via `~/.zshenv`:
Node 20.18.1 · pnpm 9.12.0 · Flutter 3.44.4 / Dart 3.12.2. Run `pnpm run verify` before
every PR (see the root `README.md`).

## Forward modeling notes (from resolved Founder Decisions)

Recorded now so the Membership service is built right; not yet implemented (no backend exists).

- **Membership states (FD-4):** the state machine is exactly `Prospective → Member → Paused →
  Closed`. **Pause Reason is metadata** on the Paused state, never an enumeration that drives
  the state model — new reasons (medical, detention, employment gap, …) are added as data, with
  no state-machine change. Operator-initiated transitions are logged, attributable, reviewable,
  and reversible where appropriate (Article XVIII).
- **Tenure (FD-3):** one clock — Member-facing **Relationship Tenure** begins at the
  `Prospective → Member` transition (first Saturday). Any internal lifecycle timestamps
  (first wage, first remittance, …) are **operational metrics, never exposed as tenure.**
- **Consent (FD-7):** the Member experiences consent **per request** — explicit, named,
  purpose/requester-specific, default no, revocable. Engineering may cache technical
  authorization tokens behind the scenes, but that optimisation must never surface as a
  standing permission; the product stays per-request.

## When Membership reaches Engineering Lock

The critical path, in order:
1. **Fastify runtime skeleton — DONE (2026-06-29, `packages/runtime`).** Boots, a `/health`
   route, request logging through `@nia/log` (PII redaction). Runtime only — no product
   behaviour. Error-envelope + idempotency middleware and OpenAPI-base serving are deferred
   to the Membership service slice, where they have a concrete first consumer.
2. **Membership service — DONE (2026-06-29, `services/membership`).** Domain core: the
   lifecycle state machine (Prospective → Member → Paused → Closed) + identity, behind a
   `MembershipRepository` port with an in-memory adapter. Pure, fully unit-tested; no HTTP,
   logging, or persistence engine yet. The PostgreSQL adapter (ADR-0006) and HTTP wiring
   (via `@nia/runtime`) are later slices.
3. Wallet Overview backend. ← **next**
4. Wallet Overview frontend.
