# ADR-0008 — First vertical slice: Wallet Overview (read-only)

**Status:** Accepted · 2026-06-29

## Problem
Which Member-visible vertical slice is built first, after the foundation, Membership,
and the Wallet event model?

## Options considered
1. Onboarding first (`CLAUDE.md §5` lists it before Wallet Overview).
2. Wallet Overview, read-only.

## Decision
Option 2. Wallet Overview (read-only) is the first vertical slice — screens 3.1 Home →
4.1 Wallet Overview → 4.2 Transaction Detail.

## Reasoning
Article II requires balance/savings visibility to be the first surface built; Book 0
Ch. 7 orders Wallet before Onboarding; and the methodology session map places Wallet
Overview (5) before Onboarding (6). Read-only means no Wallet-mutation gate, yet it
exercises the full spine: membership read → event model → projection → audit-logged
read → i18n → offline read → design system. Onboarding is higher-staked and involves
writes, so it follows once the read spine is proven.

## Reasoning note
This resolves the ordering conflict in `CLAUDE.md §5`; per `CLAUDE.md §1` the books and
methodology win.

## Consequences
- The first feature session reads but never mutates the Wallet.
- Onboarding (writes) is sequenced after Wallet Overview.
