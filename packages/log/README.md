# packages/log

**Purpose:** Structured logging for backend services, with **Member personal-identifier
redaction** applied before anything reaches a sink. The runtime companion to the static
`no-pii-in-logs` lint gate (Book V §5.2) — defense in depth.

- `redactPii(value)` — deep-redacts values under personal-identifier keys (phone, aadhaar,
  otp, dob, address, biometric, …); structure preserved, leaves masked.
- `createLogger({ sink, base })` — emits one redacted JSON record per line; boring by
  design (Book V §1.8): no transports, no global state, an injectable sink.

**Owner:** _unassigned_
**Nia OS books:** Book V (§5.2 logging, §1.8 boring), Book VIII (audit posture); ADR-0011.
**Local setup:** Node 20 + pnpm. `pnpm --filter @nia/log test`, `… typecheck`.
**Testing:** Vitest unit tests for redaction and the logger; PII test fixtures are defined
away from log call sites so they never trip the `no-pii-in-logs` gate.
