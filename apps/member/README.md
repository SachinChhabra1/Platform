# apps/member — Member App (Flutter)

**Purpose:** The Member's app. Shows what he has, what changed, what to do next.
Offline-tolerant, read-aloud first, in the Member's language.
**Owner:** _unassigned_
**Nia OS books:** Book III, VI, VII (screens 2.x–9.x), II (Member context).
**Local setup:** _TBD — Flutter SDK._
**Testing:** E2E per flow; read-aloud and offline states are first-class test cases.

## Status — Product Review Prototype (not production)

This app currently runs as a **Product Review Prototype** (docs/methodology.md → Product
Review Prototypes), a Founder-authorised thinking tool that lets Founder and Product review
the *experience* while the Membership spec is still in Founder Review. It **compiles, runs,
and navigates** but contains **no backend, no API calls, no Wallet logic, and no product
behaviour** — every figure is placeholder and every unresolved Founder Decision (FD-#) or
Product debate (Q#) is rendered as a clearly marked placeholder, never invented behaviour.

Surfaces present: Membership Home · Wallet Overview · Profile · RafiQi placeholder · the four
anchors (Book IV §3.2) · the Operator in one tap (§3.6) · The Promise (Book I §4.19, wording
pending FD-2). Theme is local (`lib/theme/`) and Book III-grounded until `packages/tokens`
exists (ADR-0003).

Run it: `cd apps/member && flutter run` (web: `flutter run -d chrome`). It is **not a
contract** — production code derives only from an Engineering-Locked spec.
