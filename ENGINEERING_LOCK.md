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

*(None yet — the Founder has not ruled. Every row below is **Pending**. On each ruling, Claude fills the
row, writes the ADR, sets Status: Locked, and records the locking commit hash.)*

| OD | Decision | Approved option | Owner | Ruling date | ADR | Locking commit | Supersedes | Status |
|----|----------|-----------------|-------|-------------|-----|----------------|-----------|--------|
| OD-1 | Wage-flow shortfall priority | — (rec: B) | Founder | — | ADR-0012 | — | — | ⏳ **Pending ruling** |
| OD-2 | Remittance confirmed + SLA | — (rec: B) | Founder | — | — | — | — | ⏳ **Pending ruling** |
| OD-3 | RafiQi reversibility + consent | — (rec: B) | Founder | — | — | — | — | ⏳ **Pending ruling** |
| OD-4 | Offline conflict resolution | — (rec: C) | Founder | — | — | — | — | ⏳ **Pending ruling** |
| OD-5 | Savings withdrawal mechanics | — (rec: B) | Founder | — | — | — | — | ⏳ **Pending ruling** |
| OD-6 | The Floor — source of truth | — (rec: B) | Founder | — | — | — | — | ⏳ **Pending ruling** |

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
