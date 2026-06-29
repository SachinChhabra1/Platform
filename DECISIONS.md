# Decision register

The lightweight register for the Nia build. **Full architecture decisions live as ADRs
in [`docs/adr/`](docs/adr/)** (Problem · Options · Decision · Reasoning · Consequences).
Read those before proposing alternatives (`docs/methodology.md` → Architecture Decisions).
A decision that conflicts with Nia OS is invalid — the books win (`CLAUDE.md §1`).

Routine engineering **implementation** choices (frameworks, tools, libraries) live in
[`docs/engineering-stack.md`](docs/engineering-stack.md), **not** as ADRs. ADRs are
reserved for decisions that are hard to reverse, have long-term architectural
consequences, or materially change how Nia is built. Keep ADRs rare so they stay valuable.

## Accepted ADRs

| ADR | Title |
|-----|-------|
| [0001](docs/adr/0001-single-repo-cluster-bounded.md) | Single git repo, cluster-bounded deployables |
| [0002](docs/adr/0002-flutter-apps-web-console.md) | Clients: Flutter apps, web Console |
| [0003](docs/adr/0003-split-design-system-shared-tokens.md) | Split design system over shared tokens |
| [0004](docs/adr/0004-rafiqi-standalone-orchestrator.md) | RafiQi is a standalone orchestration service |
| [0005](docs/adr/0005-backend-typescript.md) | Backend language: TypeScript (Node 20 LTS) |
| [0006](docs/adr/0006-database-postgresql.md) | Database: PostgreSQL |
| [0007](docs/adr/0007-openapi-generated-clients.md) | API: OpenAPI with generated clients |
| [0008](docs/adr/0008-first-slice-wallet-overview.md) | First vertical slice: Wallet Overview (read-only) |
| [0009](docs/adr/0009-process-frozen-v1.md) | Development Methodology Freeze |
| [0010](docs/adr/0010-i18n-architecture.md) | i18n architecture |
| [0011](docs/adr/0011-typescript-testing-and-shared-libs.md) | TypeScript test runner and shared backend libraries |

## Open decisions — ruling required (expire 2026-07-13)

These do not block the foundation. Each blocks the slice named. A ruling becomes an ADR.

| OD | Decision needed | Blocks | Books |
|----|-----------------|--------|-------|
| OD-1 | Wage-flow **deduction priority on shortfall** (Member-impacting; Product/ops to rule) | Wage Flow | IV §4.2, II §2.4 |
| OD-2 | Remittance **"destination-confirmed" mechanism + escalation SLA** | Remittance completion | I §4.9, IV §4.3 |
| OD-3 | RafiQi **reversibility window** + standing-authorisation format | RafiQi | IX §5, VIII §3.8 |
| OD-4 | Offline **conflict-resolution policies** per record type | Offline write paths | V §3.4 |
| OD-5 | Savings **withdrawal mechanics** (settlement time, interest treatment) | Savings Flow | IV §4.4 |
| OD-6 | **The Floor** enumeration authoritative source | Dignity gates | I (Art. I) → V |
