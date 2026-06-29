# Decisions

Architecture decision record for the Nia build. Each entry is short and dated.
A decision that conflicts with Nia OS is invalid — the books win (`CLAUDE.md §1`).

Status values: **Accepted** · **Open** (needs a ruling) · **Superseded**.

---

## Accepted — 2026-06-29

### ADR-001 — Single git repo, cluster-bounded deployables
One git repository for source-code organisation. Services remain independently
deployable and bounded by cluster (Book V §2.8). "Monorepo" describes source
organisation, not runtime architecture.

### ADR-002 — Clients: Flutter apps, web Console
Member App and Operator App are Flutter (Book V §2.5). Theatre Console is web.
Mandated by the book; not subject to revision here.

### ADR-003 — Split design system over shared tokens
One design *language*, two implementations: `packages/tokens` (single source for
colour, type scale, spacing, motion — the Book VI theme module), consumed by
`packages/design-system-flutter` (member + operator) and
`packages/design-system-web` (console). Honours Book VI ("one component per
concept") at the token level across the Flutter/web boundary.

### ADR-004 — RafiQi is a standalone orchestration service
`services/rafiqi` is a standalone orchestration service. It owns **no**
source-of-truth records. It acts through the Membership, Wallet, Living, Work and
Essentials service contracts and writes **only its own decision logs**. This keeps
RafiQi reversible and auditable (Book IX §3.2) without making it a system of record.

### ADR-005 — Backend language: TypeScript (Node 20 LTS)
Typed and boring (Book V §2.6); uniquely lets the web Console share one type
package with the backend (Book VIII type-sharing requirement).

### ADR-006 — Database: PostgreSQL
Relational system of record (Book V §2.6). Wallet event table and audit log are
append-only, enforced at the DB role level (revoked UPDATE/DELETE) plus immutability
triggers. India-resident, encrypted at rest (Book VIII §7.4, Book V §5.2).

### ADR-007 — API: OpenAPI with generated clients
Path-versioned OpenAPI contract (`/v1`); generated Dart and TypeScript clients so
Flutter apps and the web Console consume one contract. `Idempotency-Key` on every
mutation (Book VIII §1.7, §4.6).

### ADR-008 — First vertical slice: Wallet Overview (read-only)
Aligns with Article II (balance visibility is the first surface built) and Book 0
Ch. 7 (Wallet before Onboarding). Read-only — no Wallet mutation gate required —
yet exercises the full spine (membership read → event model → projection →
audit-logged read → i18n → offline read → design system).

---

## Open — ruling required (expires 2026-07-13)

These do not block PR #1. Each blocks the slice named.

### OD-1 — Wage-flow deduction priority on shortfall
If a wage is smaller than rent + remittance + Curry + savings, which is paid first?
Member-impacting policy (`CLAUDE.md §4`) — must come from product/ops, not
engineering. Blocks: Wage Flow. Books: IV §4.2, II §2.4.

### OD-2 — Remittance "destination-confirmed" mechanism + SLA
How is family receipt confirmed, and what is the escalation SLA while a remittance
is debited-but-unconfirmed? Blocks: Remittance Flow completion logic.
Books: I §4.9, IV §4.3.

### OD-3 — RafiQi reversibility window
Exact documented window for RafiQi-initiated actions (Book IX requires it
"documented"; Book VIII §3.8 references a 24h preview rule). Blocks: RafiQi slice.

### OD-4 — Offline conflict-resolution policies
Book V §3.4: "a conflict with no documented policy fails the build." Policies are
not yet enumerated (Standing-Instruction × Wage-Cycle, Nest × Theatre, Trip-Home ×
Curry). Blocks: offline write paths.

### OD-5 — Savings withdrawal mechanics
Settlement time and interest treatment for frictionless, penalty-free withdrawal
(Book IV §4.4). Blocks: Savings Flow.

### OD-6 — The Floor enumeration
Confirm the Book V enumeration of The Floor is authoritative for dignity-budget
checks (Article I points to Book V). Blocks: operational dignity gates.
