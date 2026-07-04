# R9 · Async State Audit

The living inventory of **every asynchronous surface** in the Member app and the states each
implements. Grounded by inspection (`grep FutureBuilder/StreamBuilder/await`, then reading each
consumer). A surface is **Complete** only when its state machine has no dead ends.

## The rule (Definition of Done for any async UI)

> **No asynchronous widget may exist without a complete state machine — and no spinner without an
> exit.**

```
Loading ─→ Success
   │          └─→ Empty        (if the success payload can be empty)
   └─→ Error ─→ Retry ─→ (Loading …)
        └─→ Offline ─→ (reconnect) ─→ Retry ─→ (Loading …)
```

Required states per surface: **Loading · Success · Empty (if applicable) · Error · Retry · Offline
(if applicable) · Cancellation (if applicable)**. A surface that can only *load* and *succeed* — no
error/exit — is **incomplete**, however unlikely the failure. The shared implementation is
[`apps/member/lib/widgets/nia_async.dart`](apps/member/lib/widgets/nia_async.dart) (`NiaAsyncView`:
loading · calm error · Retry, no alarm colour — Book III).

## Inventory

| Screen | Component | Load | Success | Empty | Error | Retry | Offline | Tested | Status |
|---|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| Home | Wallet balance (`home_page`) | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | ✓ | **Complete** (R9.1) |
| Home | Greeting + standing (`home_page`, membership) | ✓ | ✓ | N/A | ¹ | ¹ | ¹ | ✓ | **Complete** — graceful degrade (documented) |
| Wallet | Overview money story (`wallet_page`) | ✓ | ✓ | N/A² | ✓ | ✓ | ✓ | ✓ | **Complete** (R9.1) |
| My Family | Remittances (`my_family_page`, wallet) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **Complete** (R9.1) |
| Profile | Standing (`profile_page`, membership) | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | ✓ | **Complete** (R9.1b) |
| Profile / header | Identity (`membership_header`) | ✓ | ✓ | N/A | ✓ | ✓ | ✓ | ✓ | **Complete** (R9.2) |
| Sign-in | Session issuance (`phone_sign_in_page`) | ✓ | ✓ | N/A | ✓³ | ✓ | ✓³ | ✓ | **Complete** (R9.2) |
| Profile | Sign-out (`profile_page._confirmSignOut`) | — | — | — | — | — | — | — | **Not live** — mock (`prototypeNoOp`); the working revoke is spec 0002 Slice C (paused). Re-audit when built. |

Non-fetch async (`openOperatorSheet`, `openNiaEmergency` in `widgets/common.dart`) are sheet
presentations, not data boundaries — no load/error model applies. The offline board app (`main.dart`)
uses the sample sources, which never fail; these states matter in **live/preview** mode.

**Notes**
1. The Home greeting degrades to `Namaste` (no name) on failure **by design** — a hard error/retry on
   the first-glance greeting is worse UX than a calm degrade, and the screen's **primary** content
   (the balance) carries the error+retry. Deliberate exception, not an oversight.
2. The Wallet Overview read model always carries a wage line; a fully empty month is not reachable
   today, so Empty is N/A. Revisit if the read model can return an empty story.
3. Sign-in distinguishes **default-deny** (server refused — `ApiException` → "we don't recognise that
   number" + the Operator path) from **offline** (couldn't reach Nia — "check your connection" + Try
   again). Two different exits, not one conflated message.

## Coverage

All **implemented** async surfaces have a complete state model (the sign-out is a mock, not yet a
live boundary). Regression tests: [`apps/member/test/async_states_test.dart`](apps/member/test/async_states_test.dart)
and `phone_sign_in_test.dart`.

## Maintaining this document

Add a row whenever a new async surface is introduced; a surface may not be marked **Complete** until
every applicable state is implemented **and** tested. Re-run the inventory grep after any feature
that adds a `FutureBuilder`/`StreamBuilder`/awaited fetch. This is the objective coverage record —
trust the table, not memory.
