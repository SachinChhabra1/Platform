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

## Open decisions

**None.** OD-7 (arrears recovery ordering), opened during R3 under the Step-5 rule, was ruled by the
Founder on 2026-07-04 — see the resolved table below. No backend product decision is currently open.

## Open decisions — the OD-1…OD-6 batch: ✅ ALL RESOLVED (Founder ruling, 2026-07-04)

OD-1…OD-6 were ruled by the Founder on 2026-07-04 (ratified as recommended), each becoming an ADR and
locked in [`/ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md).

| OD | Decision | Ruling | ADR |
|----|----------|--------|-----|
| OD-1 | Wage-flow deduction priority on shortfall | **B** — Member-&-family-first waterfall; Nia's fee/advance last; backend un-paused | [ADR-0012](docs/adr/0012-wage-flow-shortfall-priority.md) |
| OD-2 | Remittance "destination-confirmed" + escalation SLA | **B** — recipient-available; 24h SLA → Operator | [ADR-0013](docs/adr/0013-remittance-confirmed-and-sla.md) |
| OD-3 | RafiQi reversibility window + standing authorisation | **B** — 24h reversible; scoped/capped/revocable consent | [ADR-0014](docs/adr/0014-rafiqi-reversibility-and-consent.md) |
| OD-4 | Offline conflict-resolution per record type | **C** — money server-authoritative, intent last-write-wins | [ADR-0015](docs/adr/0015-offline-conflict-resolution.md) |
| OD-5 | Savings withdrawal mechanics | **B** — instant-to-Wallet, T+n settle, interest to the Member | [ADR-0016](docs/adr/0016-savings-withdrawal-mechanics.md) |
| OD-6 | The Floor — authoritative source | **B** — one versioned, Founder-owned `the_floor` config | [ADR-0017](docs/adr/0017-the-floor-authoritative-source.md) |
| OD-7 | Arrears recovery ordering (opened during R3) | **B** — current cycle first; recover from surplus above the floor, oldest-first, capped (Founder config, 50%); Nia last | [ADR-0018](docs/adr/0018-arrears-recovery-ordering.md) |
