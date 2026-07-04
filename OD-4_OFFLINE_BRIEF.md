# OD-4 · Offline Conflict-Resolution Policies per Record Type — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Expires:** 2026-07-13.
**A ruling becomes an ADR and un-gates offline write paths.** Book V §3.4.

## Decision to be made

The app and kit operate offline by design; writes queue locally and sync when a network returns. **When
a queued offline write conflicts with the server state, how is the conflict resolved** — and is that one
global rule, or per record type?

## Why it matters

The Member lives in poor connectivity. Offline writes are normal, not exceptional. The wrong rule loses
data the Member cares about — worst case, **money**: a silently overwritten deduction or a double-counted
remittance. "The Member wins" (Article XII) means we may never lose or corrupt the Member's money to make
sync convenient.

## Options

**A — Global last-write-wins.** *Pro:* trivial. *Con:* catastrophic for money — a stale offline write
can clobber a correct server balance, or two devices can double-post. Reject for anything financial.

**B — Global server-authoritative (reject offline writes on conflict).** *Pro:* money-safe. *Con:*
throws away the Member's legitimate offline *intent* (a chosen swap, a profile edit, a note) whenever it
races the server. Too blunt.

**C — Per-record-type policy. ✅ RECOMMENDED.** Resolution depends on what the record *is*:
- **Money / ledger records → server-authoritative.** Offline money actions are *proposals*, reconciled
  on sync, never silently overwritten; a genuine conflict surfaces to the Operator.
- **Intent / preference records** (chosen swap, profile edit) **→ last-write-wins**, Member's latest
  action stands.
- **Append-only records** (activity, timeline) **→ merge** (union, dedup by id).

*Pro:* money is never corrupted, intent is never needlessly lost — the correct guarantee for each kind
of data, and it composes with the R9 async/offline state machines already in place. *Con:* requires each
record type to declare its strategy.

## Recommendation

**Option C.** One policy table keyed by record type; money is server-authoritative-with-reconciliation,
intent is last-write-wins, logs merge.

## Cost of delaying

Blocks all offline *write* paths (`services/edge` sync). Read-only offline (the board default) works
today; but Wage/Remittance/Savings all need offline writes, so this quietly gates the whole money-write
half of the backend — not just one slice.

## APIs · data model · services affected

- **Data model:** a sync queue with a per-type `resolution_strategy`; a `conflict` record for the
  money-reconciliation → Operator path; version/updated-at stamps per record.
- **API:** sync/reconcile endpoints (in `openapi.base.yaml` or a new `openapi.sync.yaml`).
- **Services:** `services/edge` (scaffolded); cross-cuts `wallet`, `membership`, and every write flow.
- **Depends on:** OD-6 (a money reconciliation must still respect the Floor).

## To rule it in one line

> **"OD-4 is Option C: per-record-type — money server-authoritative-with-reconciliation (offline money is
> a proposal, conflicts go to the Operator), intent last-write-wins, logs merge."**
