# ENGINEERING LOCK — Frozen Product Decisions

**The contract implementation builds against.** Once a decision appears here with **Status: Locked**,
engineering treats it as **immutable** — it may not be reinterpreted, "improved," or worked around in
code. It changes only by a **formal Founder revision** (a new ruling that supersedes the row, keeping the
old one for audit). This is what stops requirements drifting during development.

## Governance flow

```
1. Founder Decision Book (proposals)     OD_DECISION_BOOK.md + OD-1…OD-6 briefs
2. Founder rulings                        the Founder picks an option per OD
3. Engineering Lock (frozen decisions)    THIS FILE — the ruling recorded + locked
4. R2–R8 implementation                   built to realise the locked model, no improvisation
5. Verification against locked decisions  tests/acceptance assert the locked behaviour
```

**Rule for Claude (and any engineer):** during R2–R8, if a product behaviour is ambiguous, the answer is
the Locked row here — not a fresh judgement call. If no Locked row covers it, that is a **new Founder
decision**: add it to the Decision Book and stop; do not invent product behaviour in code (Constitution;
`docs/AUTONOMOUS-LOOP.md`).

## Locked decisions

**All six ruled by the Founder on 2026-07-04.** Ratified as recommended, then re-issued verbatim as an
explicit written ruling (B · B · B · C · B · B) — the options recorded below match that ruling
word-for-word. Locked by commit `f885800` (hash recorded here in the immediate follow-up commit, since a
commit can't contain its own hash).

| OD | Decision | Approved option | Owner | Ruling date | ADR | Locking commit | Supersedes | Status |
|----|----------|-----------------|-------|-------------|-----|----------------|-----------|--------|
| OD-1 | Wage-flow shortfall priority | **B** — dignity floor → rent → curry → remittance → savings → fee → advance; arrears carry forward, fee waived on employer-caused shortfall; backend un-paused | Founder | 2026-07-04 | [ADR-0012](docs/adr/0012-wage-flow-shortfall-priority.md) | `f885800` | — | 🔒 **Locked** |
| OD-2 | Remittance confirmed + SLA | **B** — confirmed = recipient-available ("Reached home"); 24h SLA → Operator; family ack optional | Founder | 2026-07-04 | [ADR-0013](docs/adr/0013-remittance-confirmed-and-sla.md) | `f885800` | — | 🔒 **Locked** |
| OD-3 | RafiQi reversibility + consent | **B** — 24h reversible; scoped/capped/time-bounded/revocable standing consent, logged; per-action fallback | Founder | 2026-07-04 | [ADR-0014](docs/adr/0014-rafiqi-reversibility-and-consent.md) | `f885800` | — | 🔒 **Locked** |
| OD-4 | Offline conflict resolution | **C** — per-type: money server-authoritative-with-reconciliation, intent last-write-wins, logs merge | Founder | 2026-07-04 | [ADR-0015](docs/adr/0015-offline-conflict-resolution.md) | `f885800` | — | 🔒 **Locked** |
| OD-5 | Savings withdrawal mechanics | **B** — instant-to-Wallet, settles T+n; interest to the Member net of disclosed fee; no early-withdrawal penalty | Founder | 2026-07-04 | [ADR-0016](docs/adr/0016-savings-withdrawal-mechanics.md) | `f885800` | — | 🔒 **Locked** |
| OD-6 | The Floor — source of truth | **B** — one versioned, Founder-owned `the_floor` config, consumed via shared lib, read-only to app, audited | Founder | 2026-07-04 | [ADR-0017](docs/adr/0017-the-floor-authoritative-source.md) | `f885800` | — | 🔒 **Locked** |
| OD-7 | Arrears recovery ordering | **B** — current-cycle claims first; recover arrears from surplus only, oldest-first, capped at 50% of surplus per cycle; Nia's own fee/advance recovered last; cap is Founder-owned config | Founder | 2026-07-04 | [ADR-0018](docs/adr/0018-arrears-recovery-ordering.md) | `de4e9bc` | — | 🔒 **Locked** |

**✅ OD-7 was opened during R3 implementation** (the Step-5 rule working) and **ruled 2026-07-04**:
recording carry-forward arrears was already locked and built (ADR-0012); *recovering* them was the
uncovered decision, so building stopped and opened OD-7 rather than invent a recovery order. Now ruled
**Option B** ([ADR-0018](docs/adr/0018-arrears-recovery-ordering.md)) — the current-cycle waterfall runs
unchanged and first, then only surplus above the dignity floor recovers arrears, oldest-first, capped
(Founder-owned config, ruled at 50%), Nia's own fee/advance last. Brief:
[`OD-7_ARREARS_RECOVERY_BRIEF.md`](OD-7_ARREARS_RECOVERY_BRIEF.md).

**🔒 R3 arrears recovery — recorded implementation judgment (2026-07-04, Founder-ratified).** ADR-0018
locks the recovery *ordering* (current cycle first · surplus-above-floor only · oldest-first · Nia last).
The **recovery cap is Founder-owned configuration, injected — never a constant baked into the recovery
algorithm** (`planArrearsRecovery` takes the cap as a parameter; the ruled 50% is supplied at composition,
0 = recovery off is the honest default until wired). Reordering the recovery waterfall, recovering Nia's
own arrears before the Member's, or dipping into the dignity floor to recover arrears are changes to locked
behaviour and **require Founder review** — they are not engineering calls.

**🔒 R7 Savings — recorded implementation judgment (2026-07-04, Founder-ratified).** ADR-0016 / OD-5
locks the savings *behaviour*: **instant-to-Wallet, T+n settlement, interest to the Member net of a
disclosed fee, no early-withdrawal penalty.** ADR-0016 does **not** fix the *numbers*. The ruling on how
the un-ruled numbers are handled:

- The interest **rate**, accrual **formula**, disclosed **fee amount**, and the settlement horizon **`n`**
  are **Founder-owned configuration**, supplied behind the `InterestAccrualPolicy` seam (rate/formula/fee)
  and the `settleAfterMs` config (`n`) — the same pattern as the Floor's concrete values behind
  `FloorSource`. They are **not** a new OD.
- **No product number is invented in code.** The default seam (`NoInterestAccrualPolicy`) yields zero
  until the Founder supplies the pricing input; the domain enforces only the *ownership* rule (yield to
  the Member, net of fee) and refuses a fee that exceeds interest (a penalty by another name).
- If a future implementation tries to **hard-code a rate/fee/formula/`n` in code**, or to **change the
  Member-owned-yield principle** (interest to anyone but the Member, or a penalty on withdrawal), that is
  a change to locked behaviour and **requires Founder review** — it is not an engineering call.

**Reversibility at a glance** (from the briefs — drives how carefully each must be ruled):

| OD | Reversible? | Why it matters |
|----|-------------|----------------|
| OD-1 | **No** — irreversible once Members rely on it | Members budget around the deduction order |
| OD-2 | **Yes (high)** | SLA duration/wording are config, tune with real data |
| OD-3 | **No (hard)** | Consent model = trust + compliance; changing it re-consents the base |
| OD-4 | **No (architectural)** | Conflict resolution is baked into every write path |
| OD-5 | **Partial** | Settlement timing tunable; interest-to-Member is sticky (a takeaway if reversed) |
| OD-6 | **No (architectural root)** | Many services depend on the Floor's source; contents still versioned |

## How a row gets locked (procedure)

On a Founder ruling for OD-N:
1. Write `docs/adr/00NN-<slug>.md` capturing the approved option and rationale (link the brief).
2. Fill the OD-N row: approved option, owner, ruling date, ADR id, **Status: Locked**.
3. Commit; paste that commit's hash into the **Locking commit** column in a follow-up (or same) commit.
4. Un-gate the slice in `ROADMAP.md`; update `DECISIONS.md` (move the OD from Open to Resolved).
5. Implementation of that slice may now begin, and must verify against the locked behaviour.

## Revising a locked decision

A Locked row is changed only by the Founder. To revise: add a **new** row (or ADR) with the new option,
set the old row's Status to **Superseded by <new ADR>**, and keep it for the audit trail. Never edit a
locked decision in place — the history is the point.

**References:** [`OD_DECISION_BOOK.md`](OD_DECISION_BOOK.md), [`FOUNDER_REVIEW.md`](FOUNDER_REVIEW.md),
[`DECISIONS.md`](DECISIONS.md), [`ROADMAP.md`](ROADMAP.md), [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md).
