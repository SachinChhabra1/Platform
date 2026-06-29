# ADR-0002 — Clients: Flutter apps, web Console

**Status:** Accepted · 2026-06-29

## Problem
What client technology do the Member App, Operator App, and Theatre Console use?

## Options considered
1. Web everywhere.
2. Fully native (separate Android/iOS codebases).
3. Flutter for the two apps; web for the Console.

## Decision
Option 3 — mandated by Book V §2.5. Member App and Operator App are Flutter; the
Theatre Console is a web application.

## Reasoning
Book mandate. One Flutter codebase serves both mobile apps with no degradation on
either platform; the Console is a desktop/tablet supervisor surface best served on web.

## Consequences
- Two design-system implementations are required (see ADR-0003); component code is not
  shared across the Dart/web boundary — design tokens are shared instead.
- The Console shares types with the backend (drives ADR-0005, ADR-0007).
