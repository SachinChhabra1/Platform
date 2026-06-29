# ADR-0009 — Development process frozen at Version 1

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (ruling) · AI Engineer (recording) |
| **Date** | 2026-06-29 |
| **Nia OS references** | `docs/methodology.md`; `docs/product/SPEC-TEMPLATE.md`; `docs/SESSION-START.md`; `docs/adr/`; `CLAUDE.md §1` |

## Context
The development process is now established and self-describing in the repository. The
Founder has declared the design of the process complete and the primary output to be
software, not documentation. Because a new session begins from the repository — not from
any prior conversation — a freeze declared only in chat would not survive; a future
session could reasonably re-open settled process work and drift.

## Problem
How do we prevent future sessions from re-opening or "improving" the established process,
and keep effort on shipping product rather than refining the framework?

## Options considered
1. Leave the freeze implicit in the conversation only.
2. Record the freeze durably as an ADR (the existing governance mechanism).

## Decision
Option 2. The following are **Version 1 and frozen**:
- Development Methodology (`docs/methodology.md`)
- Specification Lifecycle (`docs/product/SPEC-TEMPLATE.md`)
- ADR Structure (`docs/adr/`)
- Session Start Protocol (`docs/SESSION-START.md`)
- Repository Structure
- Product Specification Template (`docs/product/SPEC-TEMPLATE.md`)

These change **only** when explicitly requested, or when an actual implementation exposes a
structural weakness in them. The fixed workflow is: Founder Thinking → Nia OS → Product
Specification → Founder Review → Engineering Readiness Review → Engineering Lock →
Implementation Plan → Code → Review → Merge.

## Reasoning
The methodology should evolve because reality demanded it, not because a better process was
imagined. The repository is the permanent memory; recording the freeze keeps it true across
sessions. The process exists to serve the product, not the reverse.

## Consequences
- Future sessions assume the methodology, templates, ADRs, and lifecycle exist; they
  **extend** existing documents only when necessary and avoid creating new framework
  documents.
- Production code should now accumulate faster than documentation. If that ratio reverses,
  stop and ask whether the documentation is truly necessary.
- Product Specifications are produced one at a time in order: Membership, Wallet, Home,
  Wage, Remittance, Savings, Living, Work, Essentials, RafiQi.
- A proposed process change must cite the implementation weakness that justifies it.
