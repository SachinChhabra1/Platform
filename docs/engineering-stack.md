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

Provisioned by `scripts/bootstrap.sh` and put on `PATH` by `scripts/_env.sh`:
Node 20.18.1 · pnpm 9.12.0 · Flutter 3.44.4 / Dart 3.12.2 · Temurin JDK 21 (codegen only).
On a fresh Mac the kit installs a real `toolchain/` inside itself; the JDK is required only
to regenerate the API clients (ADR-0007), not to verify (generated clients are committed).
Run `pnpm run verify` before every PR (see the root `README.md`).

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
3. **Wallet Overview backend — DONE (2026-06-29, `services/wallet`).** A pure read-only
   read model (no ledger engine, no money movement, no policy): projects an assembled
   `WalletActivity` log into a `MonthlyOverview` with two **distinct** figures —
   `availableBalance` (usable now) vs `stayedThisMonth` (what stayed his this month) — plus
   a neutral, shame-free money story and reachable prior months (spec §3; ADR-0008).
4. **Wallet Overview frontend — DONE (2026-06-30, §14 step 4, four slices).** The prototype
   Wallet now renders from the read model and shows the two distinct §3 figures
   (`stayedThisMonth` vs `availableBalance`), no longer one number labelled "stayed".
   - **Slice 1 — contract.** `packages/types/openapi/openapi.wallet.yaml`: the first feature
     surface (`GET /v1/wallet/overview`, `…/months`), referencing the base contract's shared
     components. snake_case wire shape, money in integer paise. The contract-lint gate
     (verify.sh, package.json, ci.yml) validates base + feature files.
   - **Slice 2 — HTTP surface.** `services/wallet/src/http.ts`: a read-only driving adapter
     over the read model + `WalletActivitySource` port, composing `@nia/runtime`'s
     `createServer`. Maps the camelCase domain model → snake_case wire. Member resolved from
     the bearer token (PRE-AUTH STUB until phone-first sessions; default-deny → 401).
   - **Slice 3 — codegen.** `scripts/codegen.sh` bundles the contract (`redocly bundle`) then
     runs the pinned OpenAPI Generator **7.10.0 JAR via `java -jar`** for the Dart client and
     `openapi-typescript` for TS. We invoke the JAR directly because the npm launcher
     `@openapitools/openapi-generator-cli@2.39.0` crashes under Node 20 (`ERR_REQUIRE_ESM`).
     **Generated clients are committed** (`packages/types/generated/`) so a fresh clone and the
     verify gate need no JDK; the JDK is provisioned into the kit toolchain (Temurin 21,
     `scripts/_env.sh` + `bootstrap.sh`) only for regeneration; CI checks drift.
   - **Slice 4 — Flutter wiring.** `apps/member` depends on the generated `nia_api`; the Wallet
     renders a `MonthlyOverview` via a `WalletOverviewSource` port — `SampleWalletOverviewSource`
     (offline prototype default) and `ApiWalletOverviewSource` (real client). Tests assert the
     two distinct figures, a shame-free lean month, and client↔server wire conformance.
