# services

**Purpose:** Backend services, bounded by cluster (Book V §2.8). Independently
deployable. The Wallet is the operating layer below the clusters.
**Owner:** _unassigned_
**Nia OS books:** Book V (engineering), VIII (backend contracts, data models).
**Local setup:** TypeScript (Node 20), pnpm workspace members.
**Testing:** Unit + integration (real DB, no mocked Wallet/rail) + property tests.
