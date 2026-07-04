# 04 · Architecture

How the system is structured. **Canonical:** [`../PRODUCT_ARCHITECTURE.md`](../PRODUCT_ARCHITECTURE.md)
(the semantic scaffold — NiaBook ledger + four pillars on `PillarScaffold`, shared components,
the shell) and [`engineering-stack.md`](engineering-stack.md) (frameworks/tools). Technical
decisions live as ADRs — see [`07_DECISIONS.md`](07_DECISIONS.md). Do not restate; reference.

Implementation map (real): Flutter Member app in `../apps/member/` — `features/{niabook,pillars,shell}`
are the frozen OS; other `features/*` are legacy/prototype surfaces not mounted in the shell.
State today is sample-data `StatelessWidget`s (no Riverpod yet); navigation is an `IndexedStack`
shell + modal SOS sheet. See [`03_PRODUCT_BIBLE.md`](03_PRODUCT_BIBLE.md).
