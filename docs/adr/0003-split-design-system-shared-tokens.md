# ADR-0003 — Split design system over shared tokens

**Status:** Accepted · 2026-06-29

## Problem
Book VI requires one component per concept, but the clients span Flutter (apps) and web
(Console) — a single component library cannot serve both runtimes.

## Options considered
1. One shared web/TS component library (cannot run inside Flutter).
2. Two fully independent design systems (drift risk — Book VI forbids a separate system).
3. One design *language*, two implementations, sharing a single token source.

## Decision
Option 3. `packages/tokens` is the single source for colour, type scale, spacing,
radius, shadow, and motion timing (the Book VI theme module), consumed by
`packages/design-system-flutter` (member + operator) and `packages/design-system-web`
(console).

## Reasoning
Honours Book VI at the token level — the one place drift is most dangerous — while
respecting the mandated Flutter/web split (ADR-0002). The four reserved colours carry
meaning only and are defined once.

## Consequences
- A `no-hardcoded-theme` lint gate enforces the single token source.
- Both implementations must keep token parity; components are floor-tested.
