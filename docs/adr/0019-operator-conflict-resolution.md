# ADR-0019 — Operator money-conflict resolution model (OD-8)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling, 2026-07-04) · Engineering (implementation) |
| **Date** | 2026-07-04 |
| **Resolves** | OD-8 |
| **Brief** | [`/OD-8_RECONCILIATION_RESOLUTION_BRIEF.md`](../../OD-8_RECONCILIATION_RESOLUTION_BRIEF.md) |
| **Nia OS references** | Book IV (the Member wins); Art. XII; ADR-0015 (OD-4) |

## Context
ADR-0015 (OD-4) rules that an offline **money** write is a *proposal*: applied only if the server has not
diverged, otherwise it "surfaces to the Operator and is never silently overwritten." It defines how a
conflict is DETECTED and QUEUED — not how the Operator RESOLVES it. The read-only reconciliation surface
(list/view the queue) was built because ADR-0015 mandates it; building the resolve action stopped and
opened OD-8 (Step-5).

## Problem
When the Operator works a queued money conflict, what options do they have, and what does each do to the
Member's money?

## Options considered
1. **A** — Keep-server only (silently loses a legitimate offline write). Rejected.
2. **B** — Operator adjudication with explicit, audited outcomes.
3. **C** — Auto-resolve by rule (a blind rule on money — the risk ADR-0015 forbids). Rejected.

## Decision
**Option B.** The Operator resolves each money conflict by choosing exactly one:
- **accept-proposal** — the client's offline write becomes authoritative;
- **keep-server** — reject the proposal (the server value stands);
- **manual** — the Operator enters a corrected authoritative amount.

Every resolution is a normal **authoritative ledger write** (never a silent mutation), **records the
deciding operator + reason**, and closes the queue item. Operators authenticate with a **per-operator
credential** (so "who resolved it" is auditable) — distinct from the Member session and the service token.

## Reasoning
The resolution *is* the Member's money: three choices, three different rupee outcomes. Human adjudication
with a full audit trail is the only option that never loses a legitimate offline write and never lets a
bad one auto-apply — "if it is ever wrong, we fix it first." Per-operator identity is what makes the audit
meaningful.

## Consequences
- `ReconciliationItem` gains an `id`, the proposed record, a status (`pending → resolved`), and resolution
  provenance (operator, choice, reason, resolvedAt). A resolution produces a `SyncStore` write (except
  keep-server, which leaves the server unchanged).
- A resolve endpoint (`POST /ops/reconciliation/{itemId}/resolve`) gated by the per-operator credential;
  the read endpoints already exist.
- An operator-identity mechanism (`OperatorAuthenticator`) — a per-operator credential resolved to an
  operator id. Founder/ops-owned credentials, injected; never invented.
- **Services:** `services/wallet` (`offline_sync.ts` resolution domain; `ops_http.ts` resolve route;
  `operator_auth.ts` identity). The resolution ordering/semantics are hard-to-reverse; the credential set
  is config.
