# Architecture Decision Records

Every significant decision becomes an ADR (`docs/methodology.md` → Architecture
Decisions). **Future sessions read these before proposing alternatives.**

Each ADR contains, in order:

- **Status** · **Owner** · **Date** · **Nia OS references** (metadata block)
- **Context** — the background and forces in play
- **Problem** — the question this ADR settles
- **Options considered**
- **Decision**
- **Reasoning**
- **Consequences**

Status is `Accepted` or `Superseded`. A decision that conflicts with Nia OS is invalid —
the books win (`CLAUDE.md §1`). The Founder decides *what* is built; the AI Engineer
decides *how* — these ADRs record the *how*, approved by the Founder.

The lightweight register (this index plus the open decisions awaiting a ruling) lives
in [`/DECISIONS.md`](../../DECISIONS.md).

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-single-repo-cluster-bounded.md) | Single git repo, cluster-bounded deployables | Accepted |
| [0002](0002-flutter-apps-web-console.md) | Clients: Flutter apps, web Console | Accepted |
| [0003](0003-split-design-system-shared-tokens.md) | Split design system over shared tokens | Accepted |
| [0004](0004-rafiqi-standalone-orchestrator.md) | RafiQi is a standalone orchestration service | Accepted |
| [0005](0005-backend-typescript.md) | Backend language: TypeScript | Accepted |
| [0006](0006-database-postgresql.md) | Database: PostgreSQL | Accepted |
| [0007](0007-openapi-generated-clients.md) | API: OpenAPI with generated clients | Accepted |
| [0008](0008-first-slice-wallet-overview.md) | First vertical slice: Wallet Overview (read-only) | Accepted |
| [0009](0009-process-frozen-v1.md) | Development Methodology Freeze | Accepted |
| [0010](0010-i18n-architecture.md) | i18n architecture | Accepted |
| [0011](0011-typescript-testing-and-shared-libs.md) | TypeScript test runner and shared backend libraries | Accepted |
| [0012](0012-wage-flow-shortfall-priority.md) | Wage-flow deduction priority on shortfall (OD-1) | Accepted |
| [0013](0013-remittance-confirmed-and-sla.md) | Remittance "destination-confirmed" + escalation SLA (OD-2) | Accepted |
| [0014](0014-rafiqi-reversibility-and-consent.md) | RafiQi reversibility window + standing authorisation (OD-3) | Accepted |
| [0015](0015-offline-conflict-resolution.md) | Offline conflict-resolution per record type (OD-4) | Accepted |
| [0016](0016-savings-withdrawal-mechanics.md) | Savings withdrawal mechanics: settlement + interest (OD-5) | Accepted |
| [0017](0017-the-floor-authoritative-source.md) | The Floor: authoritative enumeration source (OD-6) | Accepted |
| [0018](0018-arrears-recovery-ordering.md) | Arrears recovery ordering (OD-7) | Accepted |
