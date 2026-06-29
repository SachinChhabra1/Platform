# Nia

The operating system of a company that exists to help migrant workers in India keep
more of what they earn and send more home.

**Nia OS is the source of truth.** When code and Nia OS disagree, the code is wrong.
Build instructions live in `CLAUDE.md`. The specification lives in `/docs/nia-os`.

**The repository is the memory.** No AI session depends on a previous chat. New here?
Start with [`docs/SESSION-START.md`](docs/SESSION-START.md). How we build:
[`docs/methodology.md`](docs/methodology.md). Why things are the way they are:
[`docs/adr/`](docs/adr/) (and the register in [`DECISIONS.md`](DECISIONS.md)).

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

### Local toolchain (canonical)

Build, run, test, and verify **locally before every PR**; CI is a second layer, not the
primary one. The toolchain installs under `~/.nia-toolchain` and is added to `PATH` via
`~/.zshenv`:

- **Node 20.18.1 + pnpm 9.12.0** (via corepack) — backend, contract, tooling.
- **Flutter 3.44.4 / Dart 3.12.2** — Member and Operator apps.

Device build toolchains (Xcode for iOS, Android SDK) are **not** installed yet; they are
needed only to build to physical devices. `flutter analyze`, `flutter test`, and the web
target work without them.

Run the full local gate before opening a PR:

```
pnpm install      # once, and after dependency changes (Flutter deps: `flutter pub get` per app/package)
pnpm run verify   # lint gates, API contract, TypeScript tests, Flutter analyze/test; mirrors CI
```
