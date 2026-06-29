# packages/types

**Purpose:** The shared API contract and the types generated from it. The OpenAPI
document is the single source; Dart and TypeScript clients are generated from it, so the
Flutter apps and the web Console consume one contract without drift (ADR-0007).

## The contract

- `openapi/openapi.base.yaml` — the **base contract**: cross-cutting, reusable components
  only (Book VIII ch. 4). It contains **no feature endpoints and no domain schemas**.
  - Versioned in the path: `/v1` (§4.6).
  - The standard **error envelope** — `code`, `message` (requester's language),
    `correlation_id`, optional `retry` hint (§4.7).
  - **`Idempotency-Key`** header, required on every mutation (§1.7, §4.1).
  - **`Accept-Language`** header — every endpoint answers in the Member's language (§4.1).
  - **`X-Nia-Server-Time`** response header — server time is the only time (§1.5).
  - Cursor pagination convention; the standard error responses; a phone-/device-bound
    `MemberSession` security scheme (§1.3); an operational `GET /health` probe.

**Feature paths and domain schemas are added only from an Engineering-Locked Product
Specification** — never inferred from Nia OS (the contract chain, ADR-0009).

## Code generation

| Script | Produces |
|--------|----------|
| `pnpm run lint:openapi` | validates the contract |
| `pnpm run generate:ts` | TypeScript types → `generated/ts/` (web Console, services) |
| `pnpm run generate:dart` | Dart client → `generated/dart/` (Flutter apps) |

`generated/` is git-ignored — it is produced from the contract, never edited by hand.

**Owner:** _unassigned_
**Nia OS books:** Book VIII (§1.7, §4.1, §4.6, §4.7); ADR-0007.
**Local setup:** Node 20 + pnpm; generation/lint tools are devDependencies. (Requires the
toolchain to be installed; see repository root.)
**Testing:** `lint:openapi` in CI; generated-client drift is checked against the committed
contract.
