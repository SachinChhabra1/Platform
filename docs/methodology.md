# Nia Development Methodology

## Building Nia with AI

This document defines how Nia will be built.

The objective is not to maximize coding speed. The objective is to maximize
correctness while minimizing architectural drift.

Nia OS is the source of truth. Every implementation derives from it.

---

## Core Principle

The repository is the memory. The AI context window is temporary.

Every completed piece of work becomes part of the repository, allowing future AI
sessions to continue without depending on previous conversations.

No single AI session is expected to build Nia. Many small sessions build Nia together.

---

## Roles

### Founder
Responsible for: Vision · Product philosophy · Economic decisions · Member experience ·
Final approval. **The Founder decides what gets built.**

### Product
Responsible for: Product thinking · Behaviour · User journeys · Edge cases · Product
specifications · Prioritisation. **Product decides how the experience should work.**

### AI Engineer
Responsible for: Architecture implementation · Backend · Frontend · Testing ·
Infrastructure · Documentation · Refactoring. **The AI Engineer decides how to
implement, never what to build.**

---

## Development Cycle

Every feature follows exactly the same cycle.

**Phase 1 — Define the problem.** What Member problem exists? Why does this matter?
Which Nia OS principles apply? What should the experience be? → Output: product
specification. No code.

**Phase 2 — Implementation planning.** The AI Engineer reads relevant books, reviews
the existing repository, identifies dependencies and risks, produces an implementation
plan, and breaks work into reviewable tasks. → Output: implementation plan. No code.

**Phase 3 — Build.** Every task becomes a Pull Request. Each PR: small, self-contained,
reviewable, tested, reversible. Large features are never built in one PR.

**Phase 4 — Review.** Review focuses on behaviour, not coding style. Does this behave
correctly? Does it follow Nia OS? Does it improve Member experience? Does it introduce
drift?

**Phase 5 — Merge.** Once approved: merge, update repository, close task. The repository
becomes the permanent memory.

---

## Product Review Prototypes

*Founder decision, 2026-06-29. A working rhythm that runs alongside Phase 1, before Engineering Lock.*

As Founder Decisions are approved, the AI Engineer produces a **Product Review Prototype** so
Founder and Product can review the *experience* visually while the specification is still
evolving — rather than imagining it from documents.

A Product Review Prototype **is a thinking tool, not production software.** It must:

- compile, run, and navigate;
- follow Book III design principles;
- use **placeholder data only** — no backend, no API calls, no Wallet logic, no product behaviour;
- render **every unresolved Founder Decision as a clearly marked placeholder**, never as invented behaviour.

It exists to improve Product thinking, **not to accelerate implementation.** Nothing in a
prototype is a contract; only an Engineering-Locked spec is. The prototype evolves continuously
as Founder Decisions are approved. When real implementation begins (post-Lock, Phase 3), screens
are wired to backend per the locked spec — the prototype's placeholders are replaced, not trusted.

This does **not** relax the contract chain: prototypes are explicitly Founder-authorised
visual exploration; production code still derives only from an Engineering-Locked spec.

---

## Founder Decisions — just-in-time

*Founder decision, 2026-06-29. Changes the **timing** of Founder Decisions, not the process.*

Do **not** work through Founder Decisions sequentially. Raise a Founder Decision only when it
becomes the **next genuine blocker**. The question is never "what is the next FD in the
document?" but "**what Founder Decision must be resolved to make the next Product Review Build
or Engineering milestone meaningfully better?**" — that is the next one.

Raise an FD only if at least one is true:
- it blocks implementation, **or**
- it blocks a Product Review, **or**
- it blocks a Product Specification from reaching Engineering Lock, **or**
- it materially changes the Member experience **now**.

Otherwise: **continue building, carry the unresolved item as an explicit placeholder, and do
not force a decision early.** Product Review Builds are the primary driver — as Founder and
Product review the running application, the next real decisions surface naturally; resolve
them then. This increases Founder control: attention is spent on decisions that matter now,
while the product is visible and the consequences are concrete — not on theoretical decisions
months before they affect the Member.

**Working rhythm:** Product Review Build → identify the next real blocker → Founder Decision →
specification updated → prototype updated → implementation continues → repeat.

Engineering note: if an unresolved Founder Decision does not block engineering work, continue
within delegated authority; if it does, surface it.

---

## AI Session Strategy

Never attempt to build Nia in one conversation. Instead:

1. Architecture
2. Repository foundation
3. Membership
4. Wallet
5. Wallet Overview
6. Onboarding
7. Savings
8. Remittance
9. Operator
10. RafiQi

Each session begins from the repository, not the previous chat.

---

## Context Strategy

Every new AI session: (1) reads Nia OS, (2) reads the repository, (3) reads the current
task, (4) builds only that task. The AI is never expected to remember previous
conversations.

---

## Build Strategy

Never build horizontally. Build vertically.

**Bad:** Authentication → Database → Screens → APIs → Testing.

**Good:** Wallet Overview → Database → API → Flutter → Tests → Documentation →
Production ready. Then move to the next feature.

Every completed slice should be deployable.

---

## Pull Request Rules

Every PR must: solve one problem · stay small · include tests · include rollback ·
reference relevant Nia OS sections. No unrelated refactoring. No speculative
improvements. No hidden work.

---

## Repository as Memory

The repository stores: Code · Documentation · Decisions · ADRs · Tests · Architecture.
Nothing important should live only inside an AI conversation.

---

## Architecture Decisions

Every significant decision becomes an ADR. Each ADR contains: Problem · Options
considered · Decision · Reasoning · Consequences. Future AI sessions read ADRs before
proposing alternatives.

---

## Product Decisions

The Founder and Product retain ownership of: Pricing · Economics · Behaviour · UX ·
Flows · Prioritisation · Business rules. These are never delegated to AI.

---

## Engineering Decisions

The AI Engineer owns: Code structure · Refactoring · Testing · APIs · Infrastructure ·
Performance · Deployment. Unless they conflict with Nia OS.

---

## Quality Gates

No feature is complete until: acceptance criteria pass · tests pass · Nia OS compliance
verified · human review completed · repository updated · documentation updated.

---

## Token Strategy

The context window is treated as temporary working memory, not long-term project
memory. Instead, Nia OS → Repository → ADRs → Tests → Documentation become the
persistent knowledge base. This allows the project to continue across unlimited AI
sessions.

---

## Success

The success metric is not "how much code was written." It is "how much
production-quality software was added without introducing architectural drift."

Every session should leave the repository in a better state than it found it.

That is how Nia will be built.
