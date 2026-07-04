# Session handover — Backend complete (offline)

Written 2026-07-04. **The repository is the source of truth** — this note just gets the next chat
moving fast. On pickup, read: [`NEXT_TASK.md`](../NEXT_TASK.md) → [`ENGINEERING_LOCK.md`](../ENGINEERING_LOCK.md)
→ [`PROJECT_STATUS.md`](PROJECT_STATUS.md) → [`CHANGELOG.md`](../CHANGELOG.md). Trust those over this note
if they ever disagree.

## Canonical machine

The canonical engineering machine is **`~/Developer/Nia Development`** (NOT the Desktop/iCloud copy).
Work in `repo/`. Always `source scripts/_env.sh` first (PATH + JAVA_HOME + offline pnpm store + PUB_CACHE).

## Current state

- **Branch:** `pr/membership-product-review-build`
- **HEAD:** `61b860b` — tree clean (before this doc's own commit).
- **Verify:** `./bin/nia verify` green (run from the KIT dir, `~/Developer/Nia Development`, after
  sourcing env — NOT from `repo/`). No codegen drift. `services/wallet` at **245 TS tests**; Flutter
  goldens deterministic; 12 OpenAPI contract files glob-gated (`openapi.*.yaml`).
- **Governance:** OD-1…OD-8 all **ruled + Locked** (ADRs 0012–0019). **No backend product decision is
  open** (`DECISIONS.md` open section is empty; `FOUNDER_REVIEW.md` has no open ODs).

## What is DONE — the backend is complete for everything buildable offline

Built strictly against the Founder-locked ADRs, one single-purpose slice per commit
(contract → domain → HTTP → tests → `nia verify` green → commit → update the four state docs).

- **Policy spine R3–R8 (domains + Member-facing endpoints):** R3 Wage (waterfall allocator + arrears
  carry-forward/waiver **+ OD-7 recovery**), R4 Remittance (confirmation state machine; "sent" ≠
  confirmed), R5 RafiQi (scoped/capped/time-bounded/revocable consent + 24h reversibility), R6 Offline
  (per-record-class reconciliation), R7 Savings (instant-to-Wallet, T+n, interest net of fee, no
  penalty), R8 The Floor (versioned, audited `the_floor` config behind the `FloorSource` seam).
- **Both Step-5 ODs opened, ruled, and built:** **OD-7** arrears recovery ordering (ADR-0018, Option B —
  current cycle first, surplus-above-floor oldest-first capped, Nia last) and **OD-8** Operator
  money-conflict resolution (ADR-0019, Option B — accept-proposal/keep-server/manual, authoritative
  write recording operator + reason, per-operator credential).
- **Integration hardening:** service auth (`X-Nia-Service-Token`); remittance rail webhooks
  (`openapi.rail.yaml`); scheduled SLA sweep + savings accrual/settlement jobs on a service-authed ops
  surface (`openapi.ops.yaml`); Operator reconciliation surface (read + resolve); production config
  loader + `composeWalletApp` (fully wired service).
- **Persistence:** `DurableStore<T>` primitive + `FileDurableStore` (survives restart) + durable
  adapters for **every** wallet port (compose is fully persistent, file-backed); the **PostgreSQL seam**
  `PostgresDurableStore` over an `SqlExecutor` port (no `pg` dependency added).
- **RafiQi orchestrator:** `autoTake` / `confirmedTake` / `reverseWithCompensation` over an injected
  `MoneyEffect` seam (`NoMoneyEffect` default). RafiQi *taking* an action stays the orchestrator
  boundary (ADR-0004).

**Discipline that must continue:** locked policy is immutable; no product number/credential is invented
in code — every Founder/ops value is read from config (`config.ts`) with honest-empty defaults (empty
secret ⇒ deny; cap 0 ⇒ recovery off; no Floor seed ⇒ wage refuses to run; zero-yield interest until a
rate lands). Recorded implementation judgments are in [`ENGINEERING_LOCK.md`](../ENGINEERING_LOCK.md).

## ▶ NEXT — online-only infra + Founder-gated work (no open decision)

Everything buildable in this offline sandbox is done. What remains (detail in [`NEXT_TASK.md`](../NEXT_TASK.md)):

1. **Online-only (needs network / a database):** implement `SqlExecutor` with the real `pg` driver (a
   one-liner over `pg.Pool`), run `pgKeyValueSchema` migrations, point `composeWalletApp` at
   `PostgresDurableStore` instead of `FileDurableStore`; push the list scans down to SQL. Extract the
   co-located domains into their own `services/*` packages once the workspace can add pnpm members
   (the offline sandbox cannot — that's why wage/remittance/rafiqi/savings/floor/offline are all
   co-located in `services/wallet`).
2. **Founder values (config, not engineering):** concrete `the_floor` values (`NIA_FLOOR_CONFIG_PATH`),
   savings interest rate/fee/formula + horizon `n`, the recovery cap (`NIA_RECOVERY_CAP_BPS`, ruled
   50%), and the service/operator credentials. Seams read them; never invent them.
3. **Concrete money paths behind the seams:** a real `InterestAccrualPolicy` and per-action-type RafiQi
   `MoneyEffect`s (each `reverse` the exact inverse of `apply`). **If a specific path's behaviour turns
   out to be undefined by an ADR, STOP and open an OD** (Step-5).
4. **Founder-gated, do NOT start unprompted:** R2 native packaging (Android first); retiring the legacy
   `wallet`/`home` Flutter surfaces (Q3); any frozen-screen change (Q11).

## How to resume

```bash
cd "~/Developer/Nia Development" && source scripts/_env.sh
./bin/nia verify        # from the KIT dir (not repo/). Expect: ✓ nia verify passed
cd "$NIA_REPO"          # repo/ — where all the code + docs live
```

`bin/nia` is kit scaffolding (not repo-tracked). Per-package: `pnpm --filter @nia/wallet test`,
`pnpm --filter @nia/wallet exec tsc --noEmit`. Contract lint: from `packages/types`,
`pnpm exec redocly lint openapi/openapi.<name>.yaml` (verify globs `openapi.*.yaml`).

## Architecture note (co-location caveat)

pnpm + Flutter monorepo, ports-and-adapters. Backend TS on Node 20 (ADR-0005); Postgres (ADR-0006, seam
ready); OpenAPI with generated clients (ADR-0007); RafiQi a standalone orchestrator (ADR-0004). **All
backend money domains are co-located in `services/wallet`** because the offline sandbox cannot add a new
pnpm workspace member (`tsx`→`esbuild` needs network) — each carries a bounded-context note and is to be
extracted to its own `services/*` package when online. `apps/member` (Flutter) is the Member app; its
five approved screens (NiaBook + Work/Living/Store/Family) are the design spec — read
[`../DESIGN_SYSTEM_LOCK.md`](../DESIGN_SYSTEM_LOCK.md) + [`../PRODUCT_ARCHITECTURE.md`](../PRODUCT_ARCHITECTURE.md)
before any Flutter work.

## First prompt for the next chat

> Continue the Nia backend. Repo: `~/Developer/Nia Development` (`source scripts/_env.sh`, then
> `./bin/nia verify` from the kit dir). Read `NEXT_TASK.md` + `ENGINEERING_LOCK.md`; confirm HEAD /
> tree clean. The backend is complete offline (R3–R8 + hardening + OD-7/OD-8 ruled+built + durable
> fan-out + Postgres seam + RafiQi orchestrator); **no backend product decision is open.** Only pick up
> online-only work (real `pg` + DB) or Founder-gated work if I ask. Locked policy is immutable; never
> invent a Founder value; if a slice exposes an uncovered decision, STOP and open an OD. Trust the
> repository over this handover.
