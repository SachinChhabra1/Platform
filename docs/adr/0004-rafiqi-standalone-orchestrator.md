# ADR-0004 — RafiQi is a standalone orchestration service

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | Founder (boundary ruling) · AI Engineer (implementation) |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book IX §3.2, §5; Book VIII §3.8; Book IV (RafiQi); Book I §4.15 |

## Context
RafiQi is the Member's capital allocation agent. It must be reversible, auditable, and
unable to act against the Member's interest. A design question is what it may own: if it
holds source-of-truth records, it can become a hidden second ledger and act outside
contract-mediated authority.

## Problem
Where does RafiQi live, and what persistent state may it own?

## Options considered
1. RafiQi inside the Membership cluster (an earlier proposal).
2. RafiQi as a peer service that owns its own source-of-truth records.
3. RafiQi as a standalone orchestration service that owns **no** source-of-truth
   records, acting only through other services' published contracts.

## Decision
Option 3 (Founder ruling). `services/rafiqi` is a standalone orchestration service. It
does not own Membership, Wallet, Living, Work or Essentials — it orchestrates them
through their published contracts. Its own persistent state is limited to:

- decisions
- reasoning
- schedules
- execution history
- reversibility information

It **never becomes the system of record**.

## Reasoning
Keeps RafiQi reversible and fully auditable (Book IX §3.2): every action explains what
and why, shows the data used, and is reversible within a documented window. Owning no
records of other clusters means RafiQi can never become a hidden source of truth or act
without a logged, contract-mediated authority.

## Consequences
- RafiQi must define a standing-authorisation mechanism and reversibility window
  (Open Decision OD-3).
- Its datastore holds only the five state categories above; all effects on Member
  records flow through other services' contracts.
- Senior review applies — RafiQi acts on money.
