# Product Specification — Template & Rules

| | |
|---|---|
| **Status** | Standing rules for every Product Specification |
| **Owner** | Founder / Product (own specs) · AI Engineer (drafts strawmen, runs Engineering Readiness Review) |
| **Date** | 2026-06-29 (rev. 3 — one-concept principle; mandatory Boundary Contracts section) |
| **Source** | Founder process-refinements, 2026-06-29 (FD-1 ruling); `docs/methodology.md` |

A Product Specification is a **living document**, not a one-off. It begins as a strawman
and matures, through review, into the **contract** from which implementation is planned.
It is derived only from Nia OS. Where the books are silent, the spec **stops** and records
the question — it does not invent policy.

---

## The contract chain (read this first)

```
Nia OS  →  Product Specification  →  Implementation Plan  →  Code
```

**Implementation never derives directly from Nia OS.** Engineering derives behaviour from
the **approved, Engineering-Locked** Product Specification — never by inferring it from the
books. This keeps every Product decision explicit. If the spec is silent on a behaviour,
that is a gap to resolve in the spec, not a gap for Engineering to fill from Nia OS.

---

## One specification, one concept (governing principle)

*Founder principle, 2026-06-29 (FD-1 ruling). Governs every Product Specification.*

**A Product Specification owns one concept. A flow owns one journey. A state machine owns
one lifecycle. Do not mix them.** Each specification must be understandable without becoming
the others.

The boundary between specifications is **intentional, not a weakness**. A behaviour that
belongs to a neighbouring concept is referenced at the boundary — never absorbed. When two
specs both seem to want a behaviour, that is a boundary to draw, not a reason to merge them.

Worked example (Membership family): Membership owns the *relationship*; Onboarding owns
*becoming a Member*; Trip Home owns *temporary departure and return*; Off-boarding owns
*leaving*. Four concepts, four specs.

---

## Product definition, not operational parameters (governing principle)

*Founder principle, 2026-06-29 (FD-5 ruling). Governs every Product Specification.*

A Product Specification defines **concepts, relationships, states, transitions, and
guarantees.** It must **not** hard-code **operational parameters that can change
independently** of the product definition — durations, thresholds, rates, review windows,
caps. Those belong in **operating policy**, so operations can change them without changing
what the product *is*.

The spec states the *shape* ("a Paused Membership remains Paused until the Member resumes, the
Membership is Closed, or operational policy requires review"); policy supplies the *numbers*
(how long, at what rate, what triggers review). When a value can change without changing the
concept, it is policy, not product.

---

## The AI Engineer's role when drafting specs

The AI Engineer is **not** a Product Manager and **not** the Founder — an engineer capable
of helping Product think.

**May:** organise thinking · identify inconsistencies · surface edge cases · draft strawman
specifications · identify Founder decisions · challenge contradictions · improve clarity.

**May not:** invent policy · optimise business economics · decide Member behaviour · decide
pricing · decide prioritisation · decide product strategy.

On reaching such a decision, **stop and surface it** — under *Founder Decisions Required*
(only the Founder can decide) or *Questions Product Should Debate* (a competing product idea
for Product to weigh).

---

## The four-phase living-document lifecycle

| Phase | Name | Owner | Produces |
|---|---|---|---|
| Spec Phase 1 | **Strawman** | AI Engineer | the draft (reduce blank-page work) |
| Spec Phase 2 | **Founder Review** | Founder / Product | **Version 1** — assumptions changed, Founder Decisions answered, ideas rejected/added, journeys refined |
| Spec Phase 3 | **Engineering Readiness Review** | AI Engineer (thinking as Engineering) | a list of surfaced concerns — **not** solutions |
| Spec Phase 4 | **Engineering Lock** | Founder / Product resolve, then freeze | a frozen, versioned spec — the implementation contract |

**No production code begins before a Product Specification reaches Engineering Lock.**
Implementation planning (the methodology's engineering Phase 2) starts only after Lock.

### Spec Phase 3 — Engineering Readiness Review checklist
After Product approves Version 1, the AI Engineer reviews the spec **as Engineering** and
**surfaces, does not solve**:
- ambiguity · inconsistency · missing states · impossible behaviour · missing edge cases
- implementation risks · audit implications · privacy implications · Wallet implications

Each item is raised for Product to resolve; the AI Engineer does not decide them.

---

## Status (every spec carries one)

`Draft` → `Founder Review` → `Engineering Review` → `Engineering Locked` → `In Development`
→ `Implemented` → `Deprecated`.

Mapping: Strawman = `Draft`; Founder Review = `Founder Review`; Engineering Readiness Review
= `Engineering Review`; Engineering Lock = `Engineering Locked`; then `In Development`,
`Implemented`, and finally `Deprecated`. The **specification register** in
[`README.md`](README.md) must always show where every spec sits.

---

## Required structure

Every Product Specification contains these sections, in order:

1. **Problem** — the Member problem, plainly.
2. **Why the problem exists** — the structural reasons it is real.
3. **Desired Member experience** — what good feels like for the Member.
4. **User journeys** — intent → outcome, at product level.
5. **States** — the states and the transitions between them.
6. **Edge cases** — where behaviour departs from the default.
7. **Success criteria** — how we know it works, in Member terms.
8. **Assumptions** — marked, offered for correction. Assumptions are not facts.
9. **Founder decisions required** — decisions only the Founder can make; not resolved here.
10. **References to Nia OS** — every behaviour traces to a section.
11. **Questions Product Should Debate** — 2–5 competing product ideas (see below).
12. **Future Extensions** — ideas intentionally excluded from the current version (see below).
13. **Boundary Contracts** — what enters, what leaves, who owns each transition (see below).

A status block and a scope note precede section 1.

**Forbidden in a Product Specification:** implementation, APIs, database/data models,
architecture, or any engineering. Those belong only after Engineering Lock, in Phase 2
implementation planning.

### Section 11 — Questions Product Should Debate
**Not** Founder decisions — competing product ideas that deserve discussion. Present **2–5**;
for each give the **trade-off**, **why it matters**, and **possible options**, **without
recommending one unless Nia OS already answers it** (then state the books as fact, not
recommendation). Purpose: help Product think deeply without transferring ownership.

### Section 12 — Future Extensions
Ideas intentionally excluded from the current version, recorded so future sessions do not
rediscover them. **Future Extensions are not backlog and not commitments** — they are
recorded possibilities. Keep them distinct from Founder Decisions (needed to ship the
current version) and Questions (debates about the current version).

### Section 13 — Boundary Contracts
*Mandatory in every spec (Founder ruling, 2026-06-29). Enforces the one-concept principle.*

Every specification ends by naming its seams, so the boundary stays explicit and drift
cannot enter the gap between two specs. State three things:

- **What enters** — the inputs/triggers this spec receives from neighbouring specs, and from
  which spec each arrives.
- **What leaves** — the outputs/triggers this spec hands to neighbouring specs, and to which.
- **Who owns each transition** — for every state transition touching a boundary, name the one
  spec that owns it. A transition is owned by exactly one spec; the neighbour references it.

A Boundary Contract names *what crosses the line and who owns it* — never how the neighbour
behaves internally. If a contract is missing or ambiguous, the spec is not Engineering-ready.
