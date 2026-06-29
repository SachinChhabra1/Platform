# packages/types

**Purpose:** Shared types and the OpenAPI contract. Generated Dart and TypeScript
clients flow from here so Flutter apps and the web Console consume one contract.
Every mutation carries an `Idempotency-Key`; every error uses the standard envelope.
**Owner:** _unassigned_
**Nia OS books:** Book VIII (§4 API contracts, §4.6 versioning, §4.7 errors).
**Local setup:** _TBD — pnpm workspace member._
**Testing:** Contract tests; generated-client drift checks.
