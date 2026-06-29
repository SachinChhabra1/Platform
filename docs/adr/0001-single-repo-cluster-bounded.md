# ADR-0001 — Single git repo, cluster-bounded deployables

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | AI Engineer · approved by Founder |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book V §2.8; Book VIII (type-sharing); `CLAUDE.md §1`, §6 |

## Context
The build needs a source-code home. Nia OS bounds services by cluster and keeps them
independently deployable. "Monorepo" had been raised as if it were an architectural
choice; it is not. Repository organisation and runtime architecture are separate
concerns and do not conflict.

## Problem
How do we organise source code while keeping services independently deployable and
cluster-bounded, without implying a shared runtime?

## Options considered
1. Many repositories — one per service.
2. Monorepo with a shared runtime / single deployable.
3. Single git repo; services independently deployable and cluster-bounded.

## Decision
Option 3. One git repository for source organisation; services remain independently
deployable and bounded by cluster. This is settled as a source-code management
decision, not a runtime-architecture decision.

## Reasoning
A single repo enables atomic cross-cutting change and the type-sharing Book VIII
requires, while cluster boundaries are preserved at deploy time, not in VCS. Many repos
would fragment the contract; a shared runtime would violate Book V §2.8.

## Consequences
- CI must enforce service boundaries over time (a service touching two clusters is
  mis-bounded).
- Per-service deploy pipelines come later; no shared runtime is assumed.
- The Wallet sits as the layer below the clusters.
