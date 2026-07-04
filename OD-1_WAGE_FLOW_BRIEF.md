# OD-1 · Wage-Flow Deduction Priority on Shortfall — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Expires:** 2026-07-13 (OD window).
**A ruling becomes ADR-0012 and un-gates R3 (Wage Flow) → R4–R8.**

---

## The one question

A Member's wage lands. In a normal month it covers everything and cash goes home. **When it lands
*short*** — employer underpays, hours were cut, an advance is outstanding — the wage cannot satisfy
every claim on it. **In what order are the claims honoured, and who absorbs the gap?**

This is the core business logic of the wage-posting endpoint. It cannot be written until you rule it —
it is a Member-impacting policy, not an engineering choice.

## The claims competing for one wage

These are already the ledger categories in `openapi.wallet.yaml` (data, not yet policy):

| Claim | Whose interest | Category code |
|---|---|---|
| Member take-home (cash in hand) | **Member** | *(residual)* |
| Rent / Nest | Member (keeps the roof) | `rent` |
| Curry / essentials | Member (eats) | `curry` |
| Remittance home | **Family** | `remittance` |
| Savings | Member (future) | `savings` |
| Membership fee | **Nia** | *(fee)* |
| Advance repayment | **Nia / RafiQi** | `informal_debt_repayment` |

"Deduction priority on shortfall" = the order these are filled when the wage runs out partway down.

## Why this is a doctrine decision, not a default

The whole product exists to heal one wound: *in the informal economy, when money is short, the worker
is garnished first* (Book II §4.2, §4.8). The Promise is **"your wage, in full and on time — and if it
is ever wrong, we fix it first"** and **"one Floor for everyone"** (membership spec §4.2, FD-11). So the
shortfall order is a direct test of whether Nia keeps its own promise when it costs Nia money.

## Options

**A — Nia-protective waterfall.** Fee + advance repayment come out first; Member and family absorb the
shortfall. Protects Nia revenue and loan recovery. **Reject** — this *is* the wound the product exists to
heal (Nia garnishes the worker first). Breaks the Promise. Listed only so the trade-off is on the record.

**B — Member-&-family-first waterfall, Nia last. ✅ RECOMMENDED.** Fixed, explainable order; Nia's own
claims defer:

1. **Member dignity floor** (a hard minimum cash-in-hand — ties to OD-6 "the Floor") — never breached
2. **Rent / Nest** — keep the roof
3. **Curry / essentials** — eat
4. **Remittance home** — the family
5. **Savings**
6. **Membership fee** *(Nia)*
7. **Advance repayment** *(Nia)* — last

On a short month Nia's fee and advance recovery are what slip, not the Member's roof, food, or family.
Nia pursues the **employer** for the wage gap (the zero-tolerance promise is enforced upstream, so a true
shortfall is the exception, not the norm).

**C — Pro-rata haircut.** Every claim takes the same proportional cut above the dignity floor.
Mathematically "fair," but harder to explain plainly (violates the "represent a shortfall plainly" rule,
spec §4.2), can under-fund rent (roof risk), and still lets Nia take a full proportional fee from a short
wage — weaker optics than B. Keep as fallback.

## Recommendation (decision-ready)

**Adopt Option B**, with two parameters to confirm:

- **The one degree of freedom — rent/food vs. remittance order.** B ranks the Member's own survival
  (roof, food) above remittance home. If you'd rather protect the family remittance *above* the Member's
  own essentials, flip 2–3 with 4. My call: **keep survival first** — a Member who loses the Nest or
  can't eat can't keep earning, which protects the family more durably than one month's remittance.
- **Arrears treatment.** Deferred claims **carry forward as visible arrears**, recovered from the next
  surplus wage — **except the membership fee on an employer-caused shortfall, which is *waived*, not
  carried** ("we fix it first" — Nia does not dun the Member for the employer's failure). This defines
  whether the ledger needs an `arrears` record type (it does, under B).

## Impact · urgency · blocking

- **Impact:** unblocks R3 Wage Flow — the wage-posting endpoint, the shortfall allocator, the arrears
  record type, and the OpenAPI `wage` contract. R3 is the gate to R4–R8.
- **Backend readiness:** the scaffold is real and waiting — TypeScript/NestJS services (`services/*`),
  PostgreSQL, OpenAPI-generated clients (ADR-0005/6/7); wallet ledger categories already defined. Only
  the wage slice's *policy* is missing, and that is this ruling.
- **Urgency:** the OD window expires **2026-07-13**. This is the critical path; nothing else in the
  backend stream starts without it.
- **Blocking:** yes — gates the entire backend month.

## To rule it in one line

> **"OD-1 is Option B: dignity floor → rent → curry → remittance → savings → fee → advance; arrears
> carry forward, membership fee waived on employer-caused shortfall. Un-pause the backend."**

Change any term and I encode exactly what you say. On ruling I write **ADR-0012**, un-gate R3 in
`ROADMAP.md`, and start the Wage Flow slice against the existing backend scaffold.

**References:** `DECISIONS.md` (OD-1; ADR-0005/6/7/8), `docs/product/0001-membership-strawman-spec.md`
(§4.2 wage-in-full, "one Floor", plain-shortfall rule), `PRODUCT_ARCHITECTURE.md`,
`packages/types/openapi/openapi.wallet.yaml` (ledger categories), OD-6 (the Floor — the dignity minimum).
