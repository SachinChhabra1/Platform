# ADR-0008 — First vertical slice: Wallet Overview (read-only)

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (prioritisation) · AI Engineer (implementation) |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book I Art. II; Book 0 Ch. 7; Book VII 3.1/4.1/4.2; `docs/methodology.md` (session map) |

## Context
After the foundation, Membership, and the Wallet event model, a first Member-visible
vertical slice must be chosen. `CLAUDE.md §5` listed Onboarding before Wallet Overview,
but Article II, Book 0 Ch. 7, and the methodology session map all order Wallet first.

## Problem
Which Member-visible vertical slice is built first?

## Options considered
1. Onboarding first (`CLAUDE.md §5` literal order).
2. Wallet Overview, read-only.

## Decision
Option 2. Wallet Overview (read-only) is the first production vertical slice — screens
3.1 Home → 4.1 Wallet Overview → 4.2 Transaction Detail.

## Reasoning
Article II requires balance/savings visibility to be the first surface built; Book 0
Ch. 7 orders Wallet before Onboarding; the methodology session map places Wallet
Overview (5) before Onboarding (6). Read-only means no Wallet-mutation gate, yet it
validates the full spine: Membership → Wallet → audit → offline → i18n → design system →
backend → API contracts. Onboarding is higher-staked and involves writes, so it follows
once the read path is proven. Per `CLAUDE.md §1`, the books and methodology win over the
`§5` ordering.

## Consequences
- The first feature session reads but never mutates the Wallet.
- Onboarding (writes) is sequenced after Wallet Overview.
