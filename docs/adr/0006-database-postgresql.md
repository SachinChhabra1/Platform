# ADR-0006 — Database: PostgreSQL

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | AI Engineer · approved by Founder |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book V §2.6, §5.2; Book VIII §2.9 (append-only), §7.4 (residency) |

## Context
Book V §2.6 mandates a relational system of record but does not name a product. The
Wallet event table and audit log must be strictly append-only, and all Member personal
data must reside in India (Book VIII §7.4).

## Problem
Which relational database is the system of record?

## Options considered
1. MySQL/MariaDB.
2. A cloud-proprietary relational store.
3. PostgreSQL (managed, India region).

## Decision
Option 3. PostgreSQL as the system of record, managed, in an India region.

## Reasoning
Boring and proven (Book V §2.6); strong JSONB for fields like `Employer.sla`; precise
control to make the Wallet event table and audit log append-only — UPDATE/DELETE revoked
at the DB role level plus immutability triggers. Managed + India region meets
encryption-at-rest and data-residency requirements (Book V §5.2, Book VIII §7.4).

## Consequences
- Append-only enforcement is a database-role responsibility, not only application code.
- Ordered Wallet event processing must be guaranteed (queue/locking — a later ADR).
- All Member personal data stays in India.
