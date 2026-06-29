# ADR-0010 — i18n architecture

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | AI Engineer · approved by Founder |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book III §5.2–5.3; Book V §2.6 (boring tech); `CLAUDE.md §12`; ADR-0002, ADR-0007 |

## Context
Every Member-facing string must be localized into the primary languages — Hindi, Odia,
Bengali, Tamil, Telugu, Kannada — with English as fallback (Book III §5.2), and no surface
may ship English-first. `CLAUDE.md §12` requires all Member-facing copy to live in
`/packages/i18n`. The clients are Flutter (apps) and web (Console); the backend (TS) also
emits localized error messages.

## Problem
Where do Member-facing strings live, and how are they localized across Dart (apps) and
TypeScript (Console, backend)?

## Options considered
1. Per-app ARB files inside each Flutter app — violates the single-home rule (§12) and
   risks divergence between apps.
2. A shared Flutter localization package (`packages/i18n`) consumed by apps via a path
   dependency, using ARB + `gen-l10n`; TS surfaces generated from the same ARB later.
3. A custom cross-language i18n format and runtime spanning Dart and TS now.

## Decision
Option 2. `packages/i18n` is a Flutter localization package using **ARB + `gen-l10n`** (the
boring, idiomatic mechanism). Supported locales: `hi, or, bn, ta, te, kn, en` (en fallback).
Flutter apps depend on it by path and configure `NiaLocalizations.localizationsDelegates`
and `NiaLocalizations.supportedLocales`. TS consumers (web Console, backend error
messages) are **deferred** until a TS surface needs Member-facing copy; when they arrive
they are generated from the **same ARB source of truth**, not a parallel catalogue.

## Reasoning
Keeps a single home for copy (§12), uses Flutter's well-trodden localization path (Book V
boring-tech), and avoids inventing a cross-language runtime before any TS consumer exists.
Numerals-in-script (§5.3) are handled through `intl` locale formatting when real numeric
copy lands.

## Consequences
- ARB files are the source of truth; the generated Dart localizations are committed so a
  fresh checkout analyzes and tests without a manual generation step.
- Extending i18n to TS requires a generation step from the ARB source — a future decision.
- `packages/i18n` is the legitimate home of raw strings, so it is excluded from the
  `i18n-required` lint gate; the gate enforces externalisation everywhere else.
