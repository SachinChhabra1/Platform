# ADR-0009 — Development Methodology Freeze

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder |
| **Date** | 2026 |
| **Nia OS references** | Book I — Constitution; Book V — Engineering; Book IX — AI Engineer; Book X — Culture |

> Canonical decision text authored by the Founder. This ADR marks the transition from
> designing the development system to using it.

## Context

The initial development methodology for Nia has now been completed through the first six
repository milestones.

The repository now contains:

- Development Methodology
- Specification Lifecycle
- Session Start Protocol
- Repository Structure
- ADR Structure
- Product Specification Template

These documents are sufficient to build Nia.

Future AI sessions begin from the repository rather than from historical conversations.

Without a durable governance decision, future sessions may incorrectly continue evolving
the process instead of building software.

## Problem

How do we lock Version 1 of the methodology so future sessions build software rather than
re-open settled process work — while still allowing the process to improve when real
implementation demands it?

## Options considered

1. Leave the freeze implicit in conversation.
2. Record a durable governance decision (this ADR) that freezes Version 1 and defines the
   only grounds for future change.

## Decision

Version 1 of the Nia development methodology is frozen.

Future changes to:

- methodology
- repository conventions
- specification lifecycle
- ADR format
- session protocol
- engineering workflow

require one of the following:

1. Explicit Founder instruction.

or

2. A demonstrated weakness encountered during implementation that cannot be solved within
   the existing framework.

The absence of a feature in the methodology is not, by itself, sufficient reason to modify
it.

## Reasoning

Nia exists to build software.

The methodology exists only to help build software.

The process should evolve because implementation revealed a weakness, never because a
theoretical improvement was imagined.

This preserves stability while allowing continuous improvement through experience.

## Consequences

The default activity of the AI Engineer becomes product implementation.

The default output of the repository becomes production software.

Documentation growth becomes exceptional rather than routine.

The ratio of production code to framework documentation should increase steadily from this
point onward.
