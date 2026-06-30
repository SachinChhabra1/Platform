# Implementation Plan — Session Issuance & Recovery (spec 0002)

| | |
|---|---|
| **For spec** | [`product/0002-member-session-recovery-spec.md`](../product/0002-member-session-recovery-spec.md) — **Engineering-Locked 2026-06-30** |
| **Phase** | Methodology Phase 2 (implementation planning). **No code** until this plan's slices are reviewed and accepted. |
| **Contract chain** | Nia OS → Spec 0002 (locked) → **this plan** → Code (per-slice PRs) |
| **Date** | 2026-06-30 |

> This is an engineering document. Unlike the spec, it may name APIs, data shapes, and architecture.
> It does **not** add product behaviour — every behaviour traces to a resolved FD-S / ERR in spec 0002.
> Build **vertically**, one slice per PR: small, self-contained, tested, reversible (methodology → Build
> Strategy, PR Rules).

---

## 1. What already exists (reuse, do not rebuild)

- **`@nia/runtime/session.ts`** — the session **boundary**: `SessionStore` port, `InMemorySessionStore`
  (a fixed `token → {membershipId, deviceId}` map), `memberFromSession(request, store)` → membership id
  or `undefined`; default-deny. Shipped `74f774a`.
- **`services/wallet`, `services/membership`** — both take a `sessions` dep and resolve the Member via
  `memberFromSession`; seed `sess-ramesh-001 → m-001`. Routes under `/v1`; error envelope + 401 on
  default-deny.
- **`packages/types`** — OpenAPI contract; `MemberSession` security scheme (opaque bearer) **exists**;
  **no session issuance/recovery operations exist.** Committed generated `nia_api` clients (ADR-0007).
- **`apps/member`** — `MemberConfig` selects live vs sample; `NIA_MEMBER_TOKEN` is the bearer.

## 2. What the spec requires (engineering translation)

| Spec ruling | Engineering meaning |
|---|---|
| FD-S1 — operator-assisted first session; phone-first re-proof | Issuance has **two paths**: operator-authenticated **bind** (first session / recovery rebind) and member **phone-first re-proof** on the bound device. |
| FD-S2 / ERR-2 — human-mediated, in-person recovery; never number-alone | Recovery is an **operator-triggered** rebind; no anonymous/number-only issuance path. |
| FD-S3 — one active bound device | Binding a member to a new device **revokes** the prior device's session. Sessions must be **revocable** (store gains `issue`/`revoke`). |
| FD-S4 / ERR-3 — number change only via assisted recovery | No "renew on number change" path; a number change funnels into recovery (no separate endpoint). |
| FD-S5 / ERR-4 — operator restores, never sees/acts inside | Operator endpoints **never return Member data**; they return only an issuance/recovery outcome. Recovery writes an **audit record** + a **member-visible notice**. |
| FD-S6 — copy | Member strings live in `@nia/i18n` (no hard-coded copy in services/app). |
| FD-S7 — employer none | No employer surface; nothing to build (a non-goal, asserted by a test that no such path exists). |
| FD-S8 / ERR-1 — Prospective limited session | A session carries a **scope** (`pre_membership` \| `member`); Wallet/Membership **reject `pre_membership`**. |
| ERR-5 — woman-contact escalation | Routing metadata on the recovery request; the escalation itself is operational, not code. |
| ERR-6 — onboarding handoff | The first-session **trigger** comes from Onboarding (cross-spec dependency — §4). |
| ERR-7 — Paused keeps sign-in; Closed loses it, operator-led reopen | Closing a membership **revokes** its sessions; reopen goes through operator bind. Needs a membership-lifecycle → session signal. |
| ERR-8 — self sign-out | A member-facing **revoke current session** operation. |

## 3. Open engineering decisions (settle in the slice that needs them — not now)

- **D1 — Operator authentication.** Operator-assisted bind and recovery require an **authenticated
  Operator**, which does not exist yet (the Operator is a neighbouring concept, not this spec). *Plan:* gate
  operator endpoints behind a **minimal ops credential** for the prototype (an `OperatorSession` / ops
  token), explicitly deferring real operator identity to the Operator spec. Decide the minimal shape in
  Slice 3. **This is the critical-path dependency.**
- **D2 — Device identity.** "Device binding" needs a device identifier. *Plan:* client-supplied
  `device_id` for the prototype (no cryptographic attestation); real attestation is FE-S1. Decide in Slice 1.
- **D3 — Idempotency.** Mutating endpoints need `Idempotency-Key` (Book VIII §1.7); no middleware exists.
  *Plan:* a tiny idempotency helper in `@nia/runtime` (Slice 1) or accept-and-document for the prototype.
- **D4 — Persistence.** `InMemorySessionStore` loses state on restart. Acceptable for the prototype;
  Postgres-backed store is a later ADR-0006 slice. *Flag, do not solve here.*
- **D5 — Member-visible recovery notice.** "Your Nia phone was changed with help from Nia" — a flag on the
  new session, or an audit entry the member reads. Decide in Slice 4.

## 4. Cross-spec dependency (carried from ERR-6)

The **operator-assisted *first* session at onboarding** depends on the **Onboarding** spec emitting the
in-person binding handoff. Onboarding is **not yet locked**. Therefore:

- **Buildable now (no Onboarding dependency):** the session *model* (scope + revoke), phone-first
  **re-proof**, **sign-out**, **recovery rebind**, **Closed force-end**, and the **operator bind
  mechanism** itself.
- **Deferred until Onboarding locks:** wiring the first-session bind to a real onboarding-completion
  trigger. Until then, the operator bind endpoint is exercised directly (ops-triggered), which is exactly
  what recovery needs anyway — so **no work is wasted**.

## 5. Slice sequence (each = one PR; vertical; deployable; tested; reversible)

**Slice A — Session model: scope + revocation (`@nia/runtime`).** *No contract, no HTTP.*
- `Session` gains `scope: 'pre_membership' | 'member'`. `SessionStore` gains `issue(session): token` and
  `revoke(token)`; `InMemorySessionStore` becomes mutable. `memberFromSession` unchanged for callers;
  add `sessionFromRequest` exposing scope.
- Wallet + Membership **reject `pre_membership`** (403/`forbidden`) — enforces FD-S8.
- Tests: scope enforcement on both services; issue/revoke; one-device revoke-prior. Rollback: revert package.
- Refs: FD-S3, FD-S8.

**Slice B — Issuance: `POST /v1/sessions` (re-proof path first).** *Contract + codegen.*
- Contract: `POST /v1/sessions` with `Idempotency-Key`; request carries the **phone-first re-proof** proof
  + `device_id`; response is `{ token, scope, server_time }`. Issuing for a member **revokes the prior
  device** (FD-S3). Server-time (§1.5).
- This is the canonical `POST /v1/sessions` the Founder named — built first for the **member re-proof**
  path (no operator dependency).
- Tests: issue → bound; second device revokes first; idempotent retry; default-deny without proof.
  Rollback: remove route + regenerate clients. Refs: FD-S1 (re-proof half), FD-S3; D2, D3.

**Slice C — Sign-out: revoke current session (member-facing).**
- Contract: `DELETE /v1/sessions/current` (or `POST …/signout`); member-authenticated; revokes the bound
  device's session (ERR-8). Copy via `@nia/i18n`.
- Tests: signed-out token now 401s; only the current device is affected. Rollback: remove route. Refs: ERR-8.

**Slice D — Recovery: operator-triggered rebind (the human-mediated path).** *Largest; may split D1/D2.*
- Decide **D1 (ops credential)**. Add an operator-gated `POST /v1/recovery` (ops surface): operator
  (already verified the Member in person, ERR-2) triggers **rebind to a new `device_id`** → revoke old,
  issue new `member`-scope session. The endpoint **returns no Member data** (ERR-4). Write an **audit
  record** (through `@nia/log`, redacted) and set the **member-visible notice** (D5) → "changed with help
  from Nia". Recovery request carries woman-contact routing metadata (ERR-5) — routing only.
- Tests: rebind issues a new session + revokes old; operator path exposes no member data; audit emitted;
  member sees the notice; number-only / no-operator path denied (FD-S2). Rollback: remove route. Refs:
  FD-S2, FD-S5, ERR-2, ERR-4, ERR-5.

**Slice E — Lifecycle: Closed force-ends sessions (ERR-7).**
- When a Membership reaches `Closed`, **revoke** its sessions; Paused does **not** (ERR-7). Needs a
  membership-lifecycle → session signal (cross-service; for the prototype, a documented internal hook or a
  shared store). Reopen is operator-led (goes through Slice D). *Flag D4 (persistence) here.*
- Tests: Closed → sessions 401; Paused → still valid. Rollback: revert hook. Refs: ERR-7.

**Slice F — App wiring (`apps/member`).**
- A **"Sign out of this phone"** action (Slice C); obtain/refresh a session via Slice B where configured;
  keep the offline sample default. Thread through `MemberConfig`.
- Tests: offline unaffected; live sign-out path (loopback, per `app_modes_test.dart` pattern). Rollback:
  revert app files. Refs: ERR-8, FD-S6.

## 6. Sequencing, value, and safety

A (foundation) → B (the named `POST /v1/sessions`, re-proof) → C (sign-out, small, high-value safety) →
D (recovery, the spec's centre, needs D1) → E (lifecycle) → F (app). A–C and the **mechanism** of D carry
**no Onboarding dependency**; only the onboarding-driven *first-session trigger* waits on Onboarding
(§4). Each slice is independently deployable and leaves `nia verify` green.

## 7. Testing & gates

Every slice: unit + HTTP tests (Vitest) on the service/runtime; contract slices regenerate `nia_api` and
must show **no codegen drift** in `nia verify`; app slices add Flutter tests (offline + loopback-live, the
existing pattern). Each slice ends green and is bundled/recovery-tested at the session's close (kit rhythm).

## 8. Risks

- **R1 (critical path) — operator auth (D1)** gates Slice D; if it grows, split a minimal ops-credential
  slice before D.
- **R2 — codegen/JDK** (ADR-0007) needed for every contract slice (B, C, D).
- **R3 — in-memory sessions** lost on restart (D4); fine for the prototype, flagged for the Postgres slice.
- **R4 — idempotency** (D3) is new; keep the helper tiny.
- **R5 — cross-service Closed signal** (Slice E) — two in-memory services don't share state; may need a
  documented hook or the shared store, decided in E.

---

**No code begins until this plan is reviewed and a slice is selected.** On approval, the natural first PR
is **Slice A** (session model: scope + revoke) — pure `@nia/runtime`, no contract, lowest risk.
