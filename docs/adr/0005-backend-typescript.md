# ADR-0005 — Backend language: TypeScript (Node 20 LTS)

**Status:** Accepted · 2026-06-29

## Problem
Book V §2.6 mandates a typed, "boring" server language but does not name one.

## Options considered
1. Go — fast, boring, but no type-sharing with the web Console.
2. Kotlin/JVM — robust, but a third language alongside Dart and TS.
3. TypeScript (Node 20 LTS).

## Decision
Option 3. TypeScript on Node 20 LTS for backend services.

## Reasoning
Typed ✓ and boring ✓ (Book V §2.6), and uniquely lets the web Console share one type
package with the backend (the Book VIII type-sharing requirement). Avoids adding a
third language to a Dart + TypeScript codebase.

## Consequences
- `packages/types` holds shared types and the API contract (ADR-0007).
- Property testing uses a TS framework (e.g. fast-check) for Wallet invariants.
- Performance-critical paths are revisited if Node proves insufficient (would need a
  new ADR).
