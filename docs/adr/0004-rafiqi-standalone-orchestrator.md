# ADR-0004 — RafiQi is a standalone orchestration service

**Status:** Accepted · 2026-06-29

## Problem
Where does RafiQi — the Member's capital allocation agent — live, and what may it own?

## Options considered
1. RafiQi inside the Membership cluster (an earlier proposal).
2. RafiQi as a peer service that owns its own source-of-truth records.
3. RafiQi as a standalone orchestration service that owns **no** source-of-truth
   records, acting only through other services' contracts.

## Decision
Option 3 (Founder ruling). `services/rafiqi` is a standalone orchestration service. It
owns no source-of-truth records. It acts through the Membership, Wallet, Living, Work
and Essentials service contracts and writes **only its own decision logs**.

## Reasoning
Keeps RafiQi reversible and fully auditable (Book IX §3.2): every action explains what
and why, shows the data used, and is reversible within a documented window. Owning no
records means RafiQi can never become a hidden second source of truth or act without a
logged, contract-mediated authority.

## Consequences
- RafiQi must define a standing-authorisation mechanism (Open Decision OD-3).
- Its decision log is its only datastore; all effects flow through other services.
- Senior review applies — RafiQi acts on money.
