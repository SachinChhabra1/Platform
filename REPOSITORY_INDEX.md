# Repository Index

A map of the repository so a session can orient without rediscovering the structure. Grounded in
the real tree (not a template). The authoritative "what wins" is
[`REPOSITORY_CONSTITUTION.md`](REPOSITORY_CONSTITUTION.md); the product spec is
[`docs/03_PRODUCT_BIBLE.md`](docs/03_PRODUCT_BIBLE.md).

This is a **cluster-bounded monorepo** (ADR-0001): Flutter clients (ADR-0002) + TypeScript
backend services (ADR-0005) over PostgreSQL (ADR-0006), with OpenAPI-generated clients (ADR-0007).

## Top level

| Path | What it is |
|---|---|
| `apps/` | Flutter apps (the clients). |
| `packages/` | Shared libraries (design system, tokens, i18n, types, runtime, logging, test-utils). |
| `services/` | TypeScript backend services (**paused** during Product Polish). |
| `infra/` | Infrastructure (README only today). |
| `docs/` | The operating manual (00–17) + ADRs + product/design specs. |
| `scripts/` | `_env.sh` (PATH bootstrap) + codegen. |
| `bin/nia` | The operational CLI: `verify`, `bundle`, `preview`. |

## `apps/`

- **`member/`** — the Member app. **The production focus.** Five hardened screens (NiaBook · Work
  · Living · Store · Family) in `lib/features/{niabook,pillars,shell}` — the board freeze is lifted
  and R1 is complete; the goldens remain the visual spec. Other
  `lib/features/*` (auth, recovery, membership, promise, home, wallet, profile, clusters,
  family/my_family, placeholder) are prototype/legacy surfaces **not mounted in the shell** — see
  the Product Bible "Surfaces not in the frozen OS" and `FOUNDER_REVIEW.md` Q3.
- **`console/`** — the web Console (ops/admin). Not the current focus.
- **`operator/`** — the Operator app. Not the current focus.

## `packages/`

`tokens/` + `design-system-flutter/` + `design-system-web/` (split design system over shared
tokens — ADR-0003) · `i18n/` (localization — ADR-0010) · `types/` (OpenAPI-generated types/clients
— ADR-0007) · `runtime/` · `log/` · `test-utils/`.

## `services/` (paused)

`edge/` (gateway) · `sessions/` · `membership/` · `wallet/` · `work/` · `living/` · `essentials/`
· `rafiqi/` (standalone orchestrator — ADR-0004) · `preview/` (drives `nia preview`). M1 shipped
the Wallet read-slice (ADR-0008); money-movement flows are gated on OD-1…OD-6 (`DECISIONS.md`).

## Verify / test surface

- Member app: `apps/member/test/` — 18 test files, 81 tests, 5 golden screenshots
  (`test/goldens/*.png`, the visual spec — keep byte-identical unless a Founder-approved change).
  See [`docs/09_TESTING.md`](docs/09_TESTING.md).
- Repository gate: `nia verify` (suite + non-destructive codegen-drift check).
- CI: `.github/workflows/ci.yml` (lint gates via `scripts/lint/`, OpenAPI contract, TS
  typecheck+test, Flutter analyze+test). Runs on a GitHub runner only when pushed to a GitHub
  remote — see `FOUNDER_REVIEW.md` Q7.

## Risk notes

Web-only client (no native build), temporary demo hosting, backend paused — see
[`KNOWN_BUGS.md`](KNOWN_BUGS.md) and [`ENGINEERING_AUDIT.md`](ENGINEERING_AUDIT.md).
