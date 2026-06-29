# ADR-0011 — TypeScript test runner and shared backend libraries

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | AI Engineer |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book V §1.8 (boring), §4 (testing), §5.2 (logging); Book VIII (audit posture); ADR-0001, ADR-0005 |

## Context
Backend services are TypeScript (ADR-0005) and need a unit-test runner and a home for
cross-cutting libraries used by every service. The first such library is structured
logging with Member-personal-identifier redaction (Book V §5.2). Testing and code
structure are the AI Engineer's remit.

## Problem
Which TypeScript test runner do we standardise on, and where do shared backend libraries
live?

## Options considered
1. Test runner: **Jest** (mature, but ESM/TS config friction), **node:test** (leanest,
   more boilerplate for mocks), or **Vitest** (TS/ESM-native, fast, minimal config).
2. Library placement: a shared package under `/packages`, or co-located inside a service.

## Decision
**Vitest** for TypeScript unit tests. Every TS package exposes `test` (`vitest run`) and
`typecheck` (`tsc --noEmit`). Shared backend libraries live as packages under
`/packages`; the first is **`packages/log`** (structured logging + PII redaction), added
to `pnpm-workspace.yaml`.

## Reasoning
Vitest runs TS and ESM with no extra transform configuration and is widely used (boring
enough, Book V §1.8). Cross-cutting code like logging is used by all clusters, so it
belongs in a shared package rather than duplicated across cluster-bounded services
(ADR-0001).

## Consequences
- `pnpm run verify` and CI run `pnpm -r --if-present test` and `typecheck` across the
  workspace.
- New shared backend packages follow this shape (`test` + `typecheck` scripts).
- Adding `packages/log` extends the `/packages` set, consistent with the precedent of
  ADR-0003 adding `packages/tokens`.
