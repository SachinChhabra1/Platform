# docs/product — Product Specifications

**Purpose:** Home for Product Specifications (Phase 1 of the development cycle). Each
feature session reads the current specification here before any implementation planning
(`docs/methodology.md` → Context Strategy).

**Ownership.** Product specifications are owned by the **Founder and Product**, produced
collaboratively (Founder + ChatGPT). They define *what* is built and *how the experience
works*: vision, behaviour, journeys, edge cases, business rules, prioritisation. The AI
Engineer does **not** create product strategy — it implements an approved specification.

**Strawman specifications.** The AI Engineer may draft a *strawman* specification when
asked. A strawman:
- is derived **only** from Nia OS;
- clearly identifies **every assumption**;
- lists **every Founder decision required**;
- invents **no** business policy where the books are silent.

A strawman is a proposal for review, never a product decision. It is marked as a draft
for Product to own.

**Template & role.** Every specification follows [`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md):
the required eleven sections (including the mandatory final *Questions Product Should
Debate*) and the AI Engineer's role boundaries when helping Product — may organise,
surface, draft, and challenge; may **not** invent policy, economics, behaviour, pricing,
prioritisation, or strategy. The first example is
[`0001-membership-strawman-spec.md`](0001-membership-strawman-spec.md).

**The contract chain.** `Nia OS → Product Specification → Implementation Plan → Code`.
Implementation derives from the **Engineering-Locked** specification, never directly from
Nia OS. A behaviour the spec does not state is a gap to resolve in the spec, not one for
Engineering to infer from the books.

**Living-document lifecycle.** Each spec moves through four phases — Strawman → Founder
Review → Engineering Readiness Review → Engineering Lock — and carries a status:
`Draft` → `Founder Review` → `Engineering Review` → `Engineering Locked` → `In Development`
→ `Implemented` → `Deprecated` (see [`SPEC-TEMPLATE.md`](SPEC-TEMPLATE.md)). No production
code begins before a spec reaches Engineering Lock.

## Specification register

The repository must always show where every specification sits.

| Spec | Title | Status | Phase |
|------|-------|--------|-------|
| [0001](0001-membership-strawman-spec.md) | Membership | **Engineering Locked** (2026-06-29) | Implemented in part (Membership + Wallet surfaces); see PROJECT_STATUS |
| [0002](0002-member-session-recovery-spec.md) | Member Session & Recovery | **Founder-Approved** (FD-S1–S7 resolved 2026-06-30) · **Engineering Review** | Spec Phase 3 — ERR prepared; Lock pending ERR-1…8 + FD-S8 |

**Owner:** _Founder / Product._
**Nia OS books:** all — a spec cites the books that bind it.
**Testing:** acceptance criteria in each spec become the slice's tests.
