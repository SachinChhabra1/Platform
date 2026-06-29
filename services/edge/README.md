# services/edge

**Purpose:** The Edge — the most fragile part of Nia. Connects to employer payroll,
bank rails, UPI, SMS, e-KYC, government registries. Every integration has a
Nia-defined contract, circuit breaker, retry policy, and reconstructable logging.
**Owner:** _unassigned_
**Nia OS books:** Book V (§2.7 Edge), VIII (§4.4 webhooks — signed, idempotent, logged).
**Local setup:** _TBD._
**Testing:** Integration with real edges where safe; webhook replay-safety tests.
