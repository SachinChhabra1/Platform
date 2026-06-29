# ADR-0001 — Single git repo, cluster-bounded deployables

**Status:** Accepted · 2026-06-29

## Problem
How do we organise source code while keeping services independently deployable and
bounded by cluster (Book V §2.8), without implying a shared runtime?

## Options considered
1. Many repositories — one per service.
2. Monorepo with a shared runtime / single deployable.
3. Single git repo, services independently deployable and cluster-bounded.

## Decision
Option 3. One git repository for source organisation; services remain independently
deployable and bounded by cluster. "Monorepo" describes source organisation, not
runtime architecture.

## Reasoning
A single repo enables atomic cross-cutting change and the type-sharing Book VIII
requires, while cluster boundaries are preserved at deploy time, not in VCS. Many
repos would fragment the contract; a shared runtime would violate Book V §2.8.

## Consequences
- CI must enforce service boundaries over time (a service touching two clusters is
  mis-bounded).
- Per-service deploy pipelines come later; no shared runtime is assumed.
- The Wallet sits as the layer below the clusters.
