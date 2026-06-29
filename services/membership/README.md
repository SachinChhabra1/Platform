# services/membership

**Purpose:** The Member **relationship and its lifecycle** — Membership *is* the product
(Book I, Article I). Owns identity (product view), the lifecycle state machine, tenure, and
continuity. Per the locked spec's narrow boundary (FD-1), it does **not** own the
*experiences* of onboarding, trip home, or off-boarding — those are separate specs,
referenced only at the §13 boundary.
**Owner:** _unassigned_
**Nia OS books:** Book VIII (§2.1 Member, §7 audit), II (Member), I (Articles XV, XVII, XVIII).
**Local setup:** TypeScript (Node 20), pnpm workspace member (`@nia/membership`).
**Testing:** Vitest unit tests over the lifecycle (legal + illegal transitions, tenure,
reason/cause metadata). Integration against a real DB + audit-log assertions arrive with the
persistence slice.

---

This is **step 2** of the spec [`0001`](../../docs/product/0001-membership-strawman-spec.md)
§14 sequence. This slice is the **domain core only** — pure lifecycle logic behind a
persistence port. No HTTP, no logging, no persistence engine yet; those arrive in later slices.

## Lifecycle

A closed four-state machine (spec §5). Member-facing labels map to Nia OS's
pending / active / paused / closed ([A5]); canonical identifiers are lowercase.

| Operation | Transition | Notes |
|---|---|---|
| `createProspective` | → `prospective` | A person Nia intends to serve (creation flow is Operator-mediated, [A3]/Q1). |
| `activate` | `prospective → member` | **The one birthday** (FD-3): Membership and Relationship Tenure both begin here. |
| `pause` | `member → paused` | Genuine intent to return (FD-4). Reason is **opaque metadata**, never a state. Tenure continues (FD-5). |
| `resume` | `paused → member` | Tenure unbroken across the pause (FD-5); reason cleared. |
| `close` | `member → closed`, `paused → closed` | Records an **opaque closure cause**. |

`relationshipTenureMonths` derives tenure (FD-3); it is **internal only** and must never be
surfaced to the Member (Q4).

## Deliberately not in this slice

- **FD-10 (removal) and FD-13 (death) flows** — gated on legal review (spec §14). `close`
  records the cause as a bare opaque tag; no due-process, dignity determination, nominee, or
  settlement behaviour is implemented.
- **Return-after-closure** (`Closed → Member / Prospective`, FD-6) — Membership owns the
  tenure reset and preserved history, but the target state and id semantics are an
  Onboarding-boundary call (§13). `closed` is terminal here.
- **Lapsed-Prospective handling** (FD-8) — a data-retention policy, not a lifecycle state.

## Persistence boundary

The domain is pure; storage sits behind `MembershipRepository` (ports & adapters).
`InMemoryMembershipRepository` is the only adapter in this slice. The PostgreSQL adapter
([ADR-0006](../../docs/adr/0006-database-postgresql.md)) lands in a later slice with a
concrete persistence consumer.

## Verify

```bash
pnpm --filter @nia/membership test       # vitest
pnpm --filter @nia/membership typecheck  # tsc --noEmit
```

Both also run under the repository-wide `pnpm run verify`.
