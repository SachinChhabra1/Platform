# services/wallet

**Purpose:** The event-sourced ledger. Every credit, debit, hold, release, reversal is
an immutable event; the balance is a projection. The most important system in Nia.
**No event is ever updated or deleted; a reversal is a new event** (Book VIII §2.9).
**Owner:** _unassigned (senior review required for every change — CLAUDE.md §9)._
**Nia OS books:** Book VIII (§2.8–2.9, §3.1 invariants), V (§2.9, §4.2 property tests).
**Local setup:** _TBD._
**Testing:** Property tests over invariants; append-only enforced at the DB role level.
