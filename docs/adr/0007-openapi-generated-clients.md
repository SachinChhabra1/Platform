# ADR-0007 — API: OpenAPI with generated clients

**Status:** Accepted · 2026-06-29

## Problem
Flutter apps (Dart) and the web Console (TS) must consume the same backend contract
without drift, with versioning and idempotency (Book VIII §4).

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
- Breaking changes require a new major version; the prior version is supported ≥12 months.
