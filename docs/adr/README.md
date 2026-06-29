# Architecture Decision Records

Every significant decision becomes an ADR (`docs/methodology.md` → Architecture
Decisions). **Future sessions read these before proposing alternatives.**

Each ADR contains: **Problem · Options considered · Decision · Reasoning · Consequences**,
plus a status (`Accepted` · `Superseded`) and date. A decision that conflicts with
Nia OS is invalid — the books win (`CLAUDE.md §1`).

The lightweight register (this index plus the open decisions awaiting a ruling) lives
in `/DECISIONS.md`.

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
