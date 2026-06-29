# Product Specification — Template & Rules

| | |
|---|---|
| **Status** | Standing rules for every Product Specification |
| **Owner** | Founder / Product (own specs) · AI Engineer (drafts strawmen to this template) |
| **Date** | 2026-06-29 |
| **Source** | Founder role-refinement, 2026-06-29; `docs/methodology.md` (Phase 1) |

Every Product Specification at Nia is a **strawman**: a draft for Product review, **never
a product decision**. It is derived only from Nia OS. Where the books are silent, the
spec **stops** and records the question — it does not invent policy.

---

## The AI Engineer's role when drafting specs

The AI Engineer is **not** a Product Manager and **not** the Founder. The AI Engineer is
an engineer capable of helping Product think.

**May:** organise thinking · identify inconsistencies · surface edge cases · draft
strawman specifications · identify Founder decisions · challenge contradictions · improve
clarity.

**May not:** invent policy · optimise business economics · decide Member behaviour ·
decide pricing · decide prioritisation · decide product strategy.

Whenever a draft reaches one of these decisions, **stop and surface it** — under *Founder
Decisions Required* if it is a decision only the Founder can make, or under *Questions
Product Should Debate* if it is a competing product idea for Product to weigh.

---

## Required structure

Every Product Specification contains these sections, in order:

1. **Problem** — the Member problem, stated plainly.
2. **Why the problem exists** — the structural reasons it is real.
3. **Desired Member experience** — what good feels like for the Member.
4. **User journeys** — intent → outcome, at product level.
5. **States** — the states and the transitions between them.
6. **Edge cases** — where behaviour departs from the default.
7. **Success criteria** — how we know it works, in Member terms.
8. **Assumptions** — marked, and offered for correction. Assumptions are not facts.
9. **Founder decisions required** — decisions only the Founder can make; not resolved here.
10. **References to Nia OS** — every behaviour traces to a section.

Then a final section:

11. **Questions Product Should Debate** — see below.

A short status block and a scope note may precede section 1.

**Forbidden in a Product Specification:** implementation, APIs, database/data models,
architecture, or any engineering. Those belong only after Product approval, in Phase 2.

---

## Questions Product Should Debate (the final section)

These are **not** Founder decisions. They are **competing product ideas that deserve
discussion** — design tensions where more than one reasonable direction exists.

Present **2–5** questions. For each:

- the **trade-off**,
- **why it matters**,
- **possible options**,

**without recommending one — unless Nia OS already answers it**, in which case state what
the books say as a fact, not a recommendation.

The purpose is to help Product think more deeply without transferring ownership of the
decision to the AI Engineer.

---

## After approval

Once Product approves a specification, the AI Engineer's next deliverables are the Phase-2
implementation plan, dependency graph, reviewable tasks, engineering risks, and a proposed
first PR (`docs/methodology.md`). Production code follows only after that plan is approved.
