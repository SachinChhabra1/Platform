# OD-8 · Operator money-conflict resolution model — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Opened during backend integration hardening**
(building the Operator reconciliation surface). **A ruling becomes ADR-0019 and un-gates conflict
resolution.**

## Decision profile

| Field | Value |
|---|---|
| Decision owner | **Founder** |
| Reversible? | **No (hard)** for the resolution semantics — it decides whose number becomes a Member's real money; a Member learns to trust (or distrust) the outcome. The audit/workflow around it is tunable. |
| Latest safe decision date | Before offline money writes run in production (a diverged money write has nowhere to land until this is ruled). Recording the conflict works today; clearing it does not. |
| Blocks | **Operator conflict resolution** — the write side of the reconciliation surface. Listing conflicts is built (read-only); resolving them is blocked here. |

## Why this is a new decision (not covered by OD-4/ADR-0015)

ADR-0015 (OD-4) rules that an offline **money** write is a *proposal*: applied only if the server has not
diverged; otherwise it "surfaces to the Operator and is **never silently overwritten**." It defines how a
conflict is DETECTED and QUEUED — it does **not** define how the Operator **RESOLVES** it: what options
the Operator has, and what each does to the Member's money. Per the Step-5 rule, that uncovered decision
stopped implementation and opened this OD. The read-only surface (list/view the queue) was built because
ADR-0015 already mandates it; the resolve action was not.

It matters because the resolution *is* the Member's money: accept the client's offline amount, keep the
server's, or enter a corrected figure — each is a different rupee outcome, and getting it wrong either
loses a Member's legitimate offline write or lets a stale/duplicate one overwrite good server state.

## Options

**A — Keep-server only** (reject the proposal; the Member re-submits online). *Pro:* simplest, safest
against bad overwrites. *Con:* silently loses a legitimate offline write; the Member's action vanishes —
against "the Member wins."

**B — Operator adjudication with explicit, audited outcomes. ✅ RECOMMENDED.** The Operator resolves each
conflict by choosing exactly one: **accept-proposal** (the client's offline write becomes authoritative),
**keep-server** (reject the proposal), or **manual** (enter a corrected authoritative amount). Every
resolution produces a normal authoritative money write through the ledger (never a silent mutation),
records the deciding operator + reason, and closes the queue item. *Pro:* no legitimate write is lost, no
bad write auto-applies, full audit; matches "if it is ever wrong, we fix it first." *Con:* needs an
operator identity/permission model and a resolution audit record.

**C — Auto-resolve by rule** (e.g. newest-wins, or largest-decrease-wins). *Pro:* no human in the loop.
*Con:* money conflicts are exactly where a blind rule is dangerous; re-creates the "silently overwritten"
risk ADR-0015 forbids. Keep as the alternative.

## Recommendation

**Option B**, confirming three things: the resolution **options** (accept-proposal · keep-server ·
manual-amount); that each resolution is an **authoritative ledger write with operator + reason recorded**;
and the **operator identity/permission** model (a per-operator credential, so "who resolved it" is
auditable — this also settles how the Operator surface authenticates beyond the interim service token).

## Cost of delaying

Low near-term (conflicts only arise once offline money writes are live, and they queue safely meanwhile),
but it blocks the write half of reconciliation: today a queued conflict can be seen but not cleared, so it
would accumulate. R3–R8 and the other infra do not depend on it.

## APIs · data model · services affected

- **Reconciliation surface:** a resolve endpoint (`POST /ops/reconciliation/{recordId}/resolve` or similar)
  gated by the operator-identity model; the read endpoints already exist.
- **Data model:** `ReconciliationItem` gains a status (`pending → resolved`) + resolution provenance
  (operator, choice, reason, at); a resolution produces a `SyncStore` write.
- **Services:** `services/wallet` (`offline_sync.ts` resolution domain; `ops_http.ts` resolve route);
  `@nia/runtime` if operator identity extends the session/auth model.

## To rule it in one line

> **"OD-8 is Option B: the Operator resolves each money conflict as accept-proposal, keep-server, or
> manual-amount; every resolution is an authoritative ledger write recording the operator and reason; and
> operators authenticate with a per-operator credential."**

**References:** [ADR-0015](docs/adr/0015-offline-conflict-resolution.md), `services/wallet/src/offline_sync.ts`,
`services/wallet/src/ops_http.ts`, [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md).
