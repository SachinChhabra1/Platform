# ADR-0007 — API: OpenAPI with generated clients

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | AI Engineer · approved by Founder |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book VIII §1.7, §4.1, §4.6, §4.7 |

## Context
Flutter apps (Dart) and the web Console (TypeScript) must consume the same backend
contract without drift, with versioning, a standard error shape, and idempotency on
every mutation (Book VIII §4).

## Problem
How is the API contract defined and consumed across Dart and TypeScript clients?

## Options considered
1. Hand-written clients per platform.
2. GraphQL.
3. OpenAPI contract with generated Dart and TypeScript clients.

## Decision
Option 3. A path-versioned OpenAPI contract (`/v1`) is the source; Dart and TypeScript
clients are generated from it.

## Reasoning
One contract, two generated clients, removes drift between Flutter and web. Path
versioning matches Book VIII §4.6; a standard error envelope (code, localized message,
correlation_id, retry hint) matches §4.7; every mutation carries an `Idempotency-Key`
(§1.7).

## Consequences
- `packages/types` owns the contract and the generated clients; CI checks generated-
  client drift.
- Breaking changes require a new major version; the prior version is supported
  ≥12 months.
