# OD-3 · RafiQi Reversibility Window + Standing-Authorisation Format — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Expires:** 2026-07-13.
**A ruling becomes an ADR and un-gates RafiQi-initiated actions.** Books IX §5, VIII §3.8; ADR-0004.

## Decision profile

| Field | Value |
|---|---|
| Decision owner | **Founder** |
| Reversible? | **No (hard).** The consent model is a **trust and compliance** commitment — once Members have granted standing authorisations under one format, changing what "consent" means is a re-consent event across the whole base, not a refactor. The reversibility *window length* is tunable; the consent *model* is not. |
| Latest safe decision date | **2026-07-13** (OD window) — before the first standing grant is issued |
| Blocks | RafiQi-initiated actions (`services/rafiqi`); touches Work / Store / Savings flows |

## Decision to be made

RafiQi is the orchestrator that acts for the Member (a smart swap, moving savings, taking an
opportunity). Two parameters: **(a) how long a RafiQi-initiated money action stays reversible**, and
**(b) the format of a *standing authorisation*** — the pre-consent that lets RafiQi act without asking
every single time.

## Why it matters

The product law is **"RafiQi finds; the Member decides"** (PRODUCT_ARCHITECTURE §, ADR-0004). RafiQi's
value is removing friction; its danger is acting *past* the Member's intent. Reversibility and scoped
consent are what let RafiQi be useful without ever becoming something that "happens to" the Member.

## Options

**A — Final on execution (no undo).** *Pro:* simplest, cleanest ledger. *Con:* directly violates "the
Member decides"; one mis-judged automated action is irreversible. Reject.

**B — 24h reversibility + scoped standing consent. ✅ RECOMMENDED.** Every RafiQi-initiated money action
carries a **24h "undo"** (visible, one tap) before it settles. A **standing authorisation** is
**explicit, scoped** (per action-type *and* a rupee cap), **time-bounded** (expires), and **revocable at
any time** — every grant and use logged. *Pro:* RafiQi stays frictionless within the Member's stated
limits, and nothing is ever unrecoverable or unbounded. *Con:* needs a grants model + reversible-until
handling.

**C — Per-action confirmation always (no standing auth).** *Pro:* maximum control. *Con:* defeats the
point of an orchestrator — every action becomes a prompt; the Member drowns in confirmations. Reject as
the default; keep as the behaviour when *no* standing grant covers an action.

## Recommendation

**Option B**, with **C as the fallback**: RafiQi acts silently only within an active, scoped, capped
standing grant; anything outside it falls back to per-action confirmation. All RafiQi money actions are
reversible for 24h.

## Cost of delaying

Blocks every RafiQi-initiated action (`services/rafiqi` stays empty). RafiQi is the "found by RafiQi"
line across Work/Store/Living — the differentiator in the demo. Unruled, RafiQi can only *display*
opportunities, never *act* on them.

## APIs · data model · services affected

- **Data model:** `authorization_grant` (scope, rupee cap, expiry, `revoked_at`, audit); action records
  with `reversible_until`; a reversal path.
- **API:** `openapi.rafiqi.yaml` (grant, revoke, list grants, initiate action, reverse action).
- **Services:** `services/rafiqi` (scaffolded, empty); touches any flow RafiQi drives — savings (OD-5),
  store swaps, work opportunities.
- **Depends on:** the Wallet ledger (records the action + its reversal).

## To rule it in one line

> **"OD-3 is Option B: 24h reversible on RafiQi money actions; standing authorisation is explicit,
> scoped by type + rupee cap, time-bounded, revocable and logged; fall back to per-action confirmation
> outside any active grant."**
