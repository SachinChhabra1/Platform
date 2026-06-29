# Nia

The operating system of a company that exists to help migrant workers in India keep
more of what they earn and send more home.

**Nia OS is the source of truth.** When code and Nia OS disagree, the code is wrong.
Build instructions live in `CLAUDE.md`. The specification lives in `/docs/nia-os`.

## Source-code organisation

A **single git repository** (source-code organisation) hosting **independently
deployable, cluster-bounded services** (runtime architecture). The two are not the
same choice — see `DECISIONS.md` (ADR-001).

```
/apps        member (Flutter) · operator (Flutter) · console (web)
/services    membership · wallet · living · work · essentials · edge · rafiqi
/packages    tokens · design-system-flutter · design-system-web · types · i18n · test-utils
/infra       /scripts        /docs/nia-os
```

- **Apps** — `member` and `operator` are Flutter; `console` is web (Book V §2.5).
- **Services** — bounded by cluster (Book V §2.8). The Wallet is the layer below the
  clusters. `rafiqi` is a standalone orchestration service that owns no
  source-of-truth records (DECISIONS.md ADR-004).
- **Packages** — one design *language*, two implementations, sharing `tokens`
  (DECISIONS.md ADR-003).

## Status

Foundation only. No Wallet logic, no business logic, no production feature code has
been written. The first feature vertical slice is **Wallet Overview (read-only)**.

## Getting started

TypeScript backend (Node 20 LTS), pnpm workspaces; Flutter apps managed by pub.
Per-package setup lives in each directory's `README.md`. Open technology and policy
decisions are tracked in `DECISIONS.md`.
