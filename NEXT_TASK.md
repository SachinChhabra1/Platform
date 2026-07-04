# Next task

The single task the next session should pick up. Kept in sync with [`ROADMAP.md`](ROADMAP.md).
Start from [`START_HERE.md`](START_HERE.md).

## Status: OD-1…OD-6 RULED + LOCKED (2026-07-04). Backend un-paused. R3–R8 UNLOCKED — implementing R3 (Wage Flow).

**OD gate cleared.** The Founder ruled all six decisions on 2026-07-04 (ratified as recommended); each is
an ADR ([0012–0017](docs/adr/README.md)) and **Locked** in [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md)
(locking commit `f885800`). Backend un-paused. **R3–R8 are UNLOCKED** — build each strictly against its
locked decision. **If implementation reveals an uncovered product decision, STOP and open a new OD — do
not invent behaviour** (Step-5 rule; `ENGINEERING_LOCK.md`).

**Implementing R3 — Wage Flow** (critical path, ADR-0012/OD-1).
- ✅ **Shortfall waterfall allocator DONE** — pure, exhaustively tested (`services/wallet/src/wage.ts`,
  `wage.test.ts`, +9 tests): dignity floor → rent → curry → remittance → savings → fee → advance; arrears
  carry forward; membership fee waived on employer-caused shortfall; money-conservation invariant asserted.
  Co-located in the wallet money domain because the offline dev sandbox can't add a new pnpm workspace
  member (`tsx`→`esbuild` needs network metadata); **extract to `services/wage` when online** (noted in
  `wage.ts`).
- ✅ **`openapi.wage.yaml` contract DONE** — `POST /v1/wage/settlements` (`settleWage`); auto-gated by the
  glob lint; validates clean. The dignity floor is deliberately not a request field.
- ✅ **Wage-posting endpoint DONE** — `registerWageSettlementRoutes` (`services/wallet/src/wage_http.ts`,
  `wage_http.test.ts`, +10 tests) on a **`FloorSource` seam** (`floor.ts`): reads the dignity floor
  server-side through the injected port, never from the client (tests prove a smuggled `dignity_floor:0`
  is ignored and take-home tracks the injected floor); runs `allocateWage`; returns the `WageAllocation`
  contract; default-deny 401/403, 400 validation, server-time header. **Concrete `the_floor` config NOT
  built** — it plugs into the seam with OD-6/ADR-0017.
- ✅ **Arrears carry-forward + waiver recording DONE** — `arrears.ts`: `ArrearsRecord` (owed, carried) and
  a DISTINCT `WaiverRecord` (fee Nia forgave on an employer-caused shortfall — never owed), pure
  `arrearsFrom`/`waiverFrom` derivations, `ArrearsLedger` port recording both kinds in separate stores +
  in-memory seam. Wired into the settlement endpoint; policy stays in the allocator (`wage.ts` untouched).
  Tests prove: arrears written on unpaid claims; waived fee recorded distinctly (no double-count); ledger
  reconciles to the returned `WageAllocation`. `arrears.test.ts` + endpoint block, wallet 39 → 54.
- 🛑 **Arrears RECOVERY is blocked on OD-7** — how recovery sits in the next wage's waterfall is NOT
  defined by ADR-0012. Per Step-5, building STOPPED and **opened OD-7**
  ([`OD-7_ARREARS_RECOVERY_BRIEF.md`](OD-7_ARREARS_RECOVERY_BRIEF.md); `FOUNDER_REVIEW.md`; `DECISIONS.md`;
  pending row in `ENGINEERING_LOCK.md`). Recording is safe to ship; recovery stays unbuilt until ruled.

**R4 — Remittance completion (ADR-0013/OD-2) — domain DONE.**
- ✅ **State machine** (`remittance.ts`): `initiated → in_transit ("sent") → confirmed_available
  ("Reached home") → settled`, plus `escalated`. **"Sent" is never confirmed**; confirmation is ONLY
  `markRecipientAvailable`; family acknowledgement is an optional flag, never the gate; 24h SLA
  (`escalateAfter`) with a pure `checkSla`. Every transition appends an append-only audit `history`,
  keyed by remittance id + funding `settlementId`.
- ✅ **Seams** (`remittance_ledger.ts`): `RemittanceStore` (auditable by id/Member), `OperatorEscalations`
  (Operator hand-off), and `escalateIfStalled` orchestration (raises + persists on a fresh SLA breach,
  idempotent). +12 tests (wallet 54 → 66) proving all five required properties.
- ✅ **Member-facing endpoint + contract DONE** — `openapi.remittance.yaml` (`POST /remittances`,
  `GET /remittances`, `GET /remittances/{id}`; auto-gated by the glob lint) and `remittance_http.ts`:
  initiate + read state/audit-history, default-deny 401/403, owner-only reads (404, no existence leak),
  server-time header. **Rail-driven transitions are NOT Member-exposed** — a Member cannot self-confirm
  (same principle as the dignity floor); tests drive confirmation through the store to prove the read
  reflects it. +7 tests (wallet 66 → 73).
- ⏭ **Remaining R4 (infra, no OD):** the rail webhook adapter (feeds `recipient_available`/`settled` with
  its own service auth) and a scheduled SLA sweep calling `escalateIfStalled`.
**R5 — RafiQi authorization + reversibility (ADR-0014/OD-3) — domain DONE.**
- ✅ **Standing authorisation** (`rafiqi.ts`): `AuthorizationGrant` scoped by action-type + rupee cap,
  time-bounded (`expiresAt`), revocable (`revokedAt`); `authorizeAction` returns **auto** (covered by an
  active grant) or **needs_confirmation** with an auditable reason (`no_grant`/`grant_inactive`/`over_cap`)
  — the per-action-confirmation fallback.
- ✅ **24h reversibility**: `takeAction` → `reversible` (`reversibleUntil` = +24h), records how it was
  authorised (auto grant vs Member confirmation); `reverseAction` (undo within the window) and pure
  `checkReversibility` (settles once elapsed). Grant/action stores auditable by id/Member. +13 tests
  (wallet 73 → 86).
- ✅ **Member-facing endpoints + contract DONE** — `openapi.rafiqi.yaml` + `rafiqi_http.ts`: grant a
  standing authorisation, revoke, list grants (transparency); list/read actions; **reverse an action**
  (200 in-window, **409 after the 24h window**). Default-deny 401/403, owner-only (404, no leak),
  server-time header. RafiQi *taking* an action stays the orchestrator boundary (seeded via the store in
  tests). +10 tests (wallet 86 → 96).
- ⏭ **Remaining R5 (infra, no OD):** the RafiQi orchestrator wiring (`authorizeAction` → auto-take) and
  reversal → target money-path compensation (e.g. savings OD-5).
- ➡️ **Now: R6 Offline** (ADR-0015) — per-record-type conflict resolution: money
  server-authoritative-with-reconciliation, intent last-write-wins, logs merge.

R2 (native packaging) remains a separate Founder go-ahead.

---
*(historical) Prior status: R9 — Production Hardening ✅ SIGNED OFF (2026-07-04); the engineering-quality
loop ran and was exhausted before the OD rulings reopened backend coding.*

*Last verified: 2026-07-04 — `nia verify` green, **92 tests / 21 files**, analyze clean, no drift,
tree clean.*

**R9 is signed off** ([`R9_SIGNOFF.md`](R9_SIGNOFF.md)). Every category is ✅ in-authority-complete or
🔒 Founder-gated; no open in-authority R9 work remains. R9 does **not** stay open for perpetual polish —
it is now a **parallel Production Hardening stream** (Founder ruling, 2026-07-04), not the terminal gate
before backend. The program runs three streams: **Claude → backend (R2–R8)**, **Vercel → design
evolution**, **Founder → OD-1…OD-6**. See the stream table at the top of [`ROADMAP.md`](ROADMAP.md).

**Frontend engineering is ~90–95% complete.** The remainder is gated polish, not implementation. The
bottleneck has moved off frontend entirely; the highest return is now **backend integration, production
data, release**.

**Honest queue state: there is no remaining in-authority engineering work that *advances the product
roadmap*.** (Optional quality work always exists — deeper test coverage, observability, dependency
upgrades, CI-on-runner — but none of it moves R2–R8, and none should block them.) Every roadmap-advancing
item needs a Founder decision or the native build. Per the loop, this is not failure — the queue is
correctly reporting a gate. **The critical path has moved entirely to Founder decisions; the highest-
leverage unlock is OD-1 / backend un-pause** (below). The OD rulings expire **2026-07-13**.

**Engineering-quality loop ran (2026-07-04) and is exhausted per the objective termination rule**
([`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md) — stop after three consecutive empty
investigations). In-authority, non-product hygiene delivered (ROADMAP E8–E12): OpenAPI contract lint via
glob (closed the ungated `sessions` spec); doc-link integrity gate + its fail-closed self-test (the
lib/cli/selftest trio); CHANGELOG brought current; a doc-accuracy sweep (PROJECT_STATUS single-source
contradiction; README verify steps).

**Investigations already ruled out this round (don't re-walk):**
- Backend infra coverage (`runtime` health/prefix, `sessions` directory, `log`, `preview`) — already
  well-tested; no gap.
- Dependency hygiene — lockfile frozen-clean, `.nvmrc` consistent across all CI jobs; only updates are
  risky **majors** (TS 6 / Vitest 4 / Redocly 2 — not behaviour-preserving, out of bounds).
- Tracked build artifacts — none (`build/`, `.dart_tool/`, `generated/` untracked); no gitignore gap.
- Remaining stale-HEAD refs (ENGINEERING_AUDIT / KNOWN_BUGS / SESSION at `d3bd715`) — dated audit
  snapshots, legitimately frozen history; leave intact.

**The next valuable engineering work is money-path / behaviour testing and implementation (wallet · wage
· remittance · savings · offline · Floor). That is OD-gated by definition** — writing those tests now
would assert behaviour that OD-1…OD-6 are meant to *define*, and would pre-empt the very rulings
[`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md) exists to freeze. So the loop correctly **stops here** and
surfaces the blocker: rule the decision book.

**The full Founder Decision Book is READY** — [`OD_DECISION_BOOK.md`](OD_DECISION_BOOK.md) — six one-page
briefs (OD-1…OD-6), each with the decision, why it matters, 2–3 options with pros/cons, a recommendation,
the cost of delay, and the APIs/data model/services affected. One sitting → six rulings → the whole
backend month (R2–R8) unlocks. Rule **OD-1 first** (critical path, [`OD-1_WAGE_FLOW_BRIEF.md`](OD-1_WAGE_FLOW_BRIEF.md))
and **OD-6 early** (the Floor is a root the others reference). Each brief now carries a **Decision profile**
(owner · reversible? · latest safe date · blocks) — the 🔴 rows (OD-1/3/4/6) are expensive to reverse, rule
them as if permanent. On each ruling: write the ADR, **freeze the decision into
[`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md)** (Status: Locked + commit hash), un-gate the slice, build
against the existing `services/*` scaffold. **During R2–R8, locked decisions are immutable** — if a
behaviour isn't covered by a Locked row, it's a new Founder decision (add to the book, don't improvise).

**Founder-gated — these are what move the product to real production:**

| Next task | Gate |
|---|---|
| **R3 — Wage Flow (backend)** | Un-pause the backend **and** rule OD-1 (`DECISIONS.md`). Say: *"un-pause backend, OD-1 is X."* |
| **R2 — native install (Android first)** | Your go-ahead + accounts/device. Say: *"build the Android install."* |
| **Q3 — retire legacy surfaces** | An in-authority cleanup once you approve the product call (retire `wallet`/`home`?). Say: *"retire the legacy wallet/home screens."* |
| R4–R8 (backend) | OD-2…OD-6 rulings + backend un-paused. |

Open Founder questions are in [`FOUNDER_REVIEW.md`](FOUNDER_REVIEW.md) (Q2, Q3, Q5, Q7). The OD
rulings expire **2026-07-13**.

## When picked up

Follow the loop in [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md): recover state → contract
→ implement → verify (`nia verify` green) → review → update state docs → single-purpose commit →
continue. Respect the Product Bible ([`docs/03_PRODUCT_BIBLE.md`](docs/03_PRODUCT_BIBLE.md)), the
ADRs, and the progress-not-engagement law. Do not invent features or redesign product behaviour.
