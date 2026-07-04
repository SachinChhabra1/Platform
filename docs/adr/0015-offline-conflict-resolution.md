# ADR-0015 — Offline conflict-resolution policies per record type (OD-4)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (product intent, 2026-07-04) · Engineering (mechanism) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-4 |
| **Brief** | [`/OD-4_OFFLINE_BRIEF.md`](../../OD-4_OFFLINE_BRIEF.md) |
| **Nia OS references** | Book V §3.4; Art. XII (the Member wins) |

## Context
The app and kit operate offline; writes queue locally and sync later. A queued offline write can conflict
with server state. The Member lives in poor connectivity, so offline writes are normal.

## Problem
How is a conflicting offline write resolved — one global rule, or per record type?

## Options considered
1. **A** — Global last-write-wins.
2. **B** — Global server-authoritative (reject offline writes on conflict).
3. **C** — Per-record-type policy.

## Decision
**Option C.** Resolution depends on the record type:
- **Money / ledger → server-authoritative-with-reconciliation.** Offline money actions are *proposals*,
  reconciled on sync, never silently overwritten; a genuine conflict surfaces to the Operator.
- **Intent / preference (chosen swap, profile edit) → last-write-wins.**
- **Append-only (activity, timeline) → merge** (union, dedup by id).

## Reasoning
Money must never be corrupted to make sync convenient (Art. XII); intent must never be needlessly lost.
Per-type gives the correct guarantee for each kind of data and composes with the R9 async/offline state
machines already in place. Baked into every write path — architectural, decide once.

## Consequences
- A sync queue with a per-type `resolution_strategy`; a `conflict` record for the money → Operator path;
  version/updated-at stamps per record.
- Sync/reconcile endpoints (`openapi.base.yaml` or a new `openapi.sync.yaml`); `services/edge` owns sync.
- Money reconciliation must still respect the Floor (ADR-0017/OD-6).
