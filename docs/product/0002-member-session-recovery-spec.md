# Strawman — Member Session & Recovery Product Specification

| | |
|---|---|
| **Status** | **FOUNDER-APPROVED (2026-06-30).** FD-S1–FD-S7 resolved by the Founder (§9). One item surfaced during approval — **FD-S8** (does a Prospective hold a session?) — remains **open**; it, plus the **Engineering Readiness Review** concerns (§14), must be resolved before **Engineering Lock**. No code (incl. `POST /v1/sessions`) begins before Lock. |
| **Spec lifecycle** | **Strawman ✓** → **Founder Review ✓ (2026-06-30)** → **Engineering Readiness Review ✓ (prepared — §14)** → Engineering Lock ☐ |
| **Concept (one per spec)** | The **Member's session** — how a Member is known on his device, and how he **recovers access** when the device is lost or the number changes. Owns *access to what is his*, nothing else. |
| **Owner** | Founder / Product (to review, correct, and own) |
| **Drafted by** | AI Engineer, to reduce blank-page work (helping Product think; not deciding) |
| **Date** | 2026-06-30 (rev. 2 — Founder Review: FD-S1–S7 resolved; FD-S7 now records the employer decision and the strawman's Prospective question is renumbered FD-S8 (open); Engineering Readiness Review added) |
| **Derived from** | Nia OS only. Every behaviour cites the section that justifies it. **No implementation / APIs / data models / token mechanics / architecture.** |

> How to read this. Everything traces to Nia OS. Where the books are silent, this document
> **stops** and records the question under **Founder Decisions Required (FD-S#)** — it does not
> invent policy. Assumptions are marked **[A-S#]** and are not facts. Competing product
> directions are raised under **Questions Product Should Debate (Q-S#)**. Numbering is namespaced
> with **-S** so it never collides with the Membership spec's FD-1…13 / Q1…5.

**Scope.** *In scope:* what a **session** is in Member terms; how a Member's **first** session
begins; how he is **kept known** on his device and **re-proves** when needed; **device binding**;
**losing the device / changing the SIM**; **human-mediated recovery**; the **audit** the Member can
see; and the **security boundaries** that keep his account his alone. *Out of scope (separate specs,
referenced only at the boundary):* identity **capture** (Onboarding, Book IV §4.1; Book VII ch. 2);
the **consent-to-share-data** flow (Membership FD-7 — *authentication is not authorization*); the
**Operator** as an institution (referenced, not defined here); the **Wallet** and its settlement
(§4.2–4.8); KYC/Aadhaar unless a compliance flow requires it (§6.5). **All engineering is out of
scope until Lock** — token format, cryptography, storage, and `POST /v1/sessions` are Phase-2
implementation, not product.

**Brief coverage map** *(an aid for review — not a canonical section; shows where each item the
brief asked us to resolve is handled).*

| Brief item | Where |
|---|---|
| How the first session is issued | §4 J-S1 · §9 **FD-S1** |
| OTP vs assisted login | §9 **FD-S1** |
| Device binding | §3 · §5 · §6 · §9 **FD-S3** · §3 *Security boundaries* |
| Lost phone / changed SIM | §4 J-S4/J-S5 · §6 edge cases |
| Human-mediated recovery | §4 J-S5/J-S6 · §9 **FD-S2**, **FD-S5** |
| Audit trail | §3 *Security boundaries* · §7 · §9 (Article XV, XVIII) |
| Operator role | §4 · §9 **FD-S5** · §13 Boundary Contracts |
| Employer role | §9 **FD-S7** (none — Founder-approved) · §3 *Security boundaries* · §13 |
| Member-facing copy | §3 *Member-facing copy* |
| Security boundaries | §3 *Security boundaries* |
| Explicitly out of scope | Scope note (above) · §12 · §13 |

---

## 1. Problem

The Member must reach everything that is his — his money, his standing, his history — through a
device, and that reach must not be as fragile as the informal systems he left. He cannot be **locked
out of his own money and identity** by a lost phone, a swapped SIM, a forgotten password, or a screen
he cannot read. And his account must be **his alone**: no employer, recruiter, labour agent, or even a
helpful Operator may quietly *become* him. Today, nothing guarantees both at once — durable access
*and* sole control.

## 2. Why the problem exists

- **He changes phones and SIMs often, and loses them.** Devices are shared, lost, stolen, sold, or
  left behind across "six to ten migrations across thirty-five years" (Book II §1.5); the lost phone
  is an ordinary event, not an exception (Book II §4.7).
- **His phone number is his most durable identifier — and his most exposed.** Numbers lapse and are
  later **reassigned by the telco to a different person**; SIMs are swapped; agents sometimes hold a
  worker's SIM. A design that trusts the number *alone* trusts the wrong thing.
- **Passwords and email assume what he may not have** — literacy, a stable email, app-store fluency
  (`nia-low-income-design`). An auth chore he cannot complete is a wall in front of his own money.
- **Others have incentive to reach his record.** Employer, recruiter, government, and capital partner
  all default to **no** on his data (Article XV; Membership FD-7). The session is the **first wall**
  before that one.
- **He does not raise problems; he leaves** (Book II §3.6). A lockout he cannot resolve is a **silent
  exit** — invisible until it is a churn number.

## 3. Desired Member experience

**He is known on his device.** Opening the app, he is already himself — being known is the quiet
continuity of the relationship, not a daily chore (Book VIII §1.3; the no-friction-as-gamification
spirit of §6.3). Re-proving who he is happens **occasionally and gently**, never constantly.

**When he must prove it's him, it is phone-first and in his language.** The proof uses what he already
has and understands — his phone and his number — never a password to memorise, and always in his
language (Book VIII §1.3, §4.1).

**He is never permanently locked out of what is his.** If he loses access, a **known human — his
Operator** — can restore him, in the same dignified, human-mediated shape as restoration (Book II
§4.7; Article XVIII; the spirit of Membership FD-9). Help is **one tap away** from any channel (Book
IV §3.6, §4.9).

**He is safe by default.** His session is bound to **his device**; possession of his number alone, or
another person's device, does not make someone him. Default-deny (Book VIII §1.4).

**A woman Member recovers without a male in the loop.** Lost-phone recovery reaches a **woman
point-of-contact in one tap** and never forces her through a male Operator (Membership FD-11).

### Member-facing copy *(in the Member's language; kept deliberately simple — FD-S6, Founder-approved)*

- **First session (Founder-approved primary string): _"This phone is now your Nia phone."_**
- The rest follow that simple, plain tone (final wording per the Founder, in each language):
  - Routine re-proof: *"Quick check — it's still you?"*
  - Lost phone: *"Lost your phone? Your Operator will help you back in. No one else can."*
  - New device: *"New phone? Your old phone will be signed out."*
  - Reassurance: *"Only you can get into your Nia — and only your Operator can help you back in."*

### Security boundaries *(product-level guarantees — the "must never happen", not mechanism)*

1. **Default-deny.** No valid session, no access (Book VIII §1.4).
2. **The number alone never authenticates a new device.** Because numbers are reassigned and SIMs
   swapped, a verified number is *necessary but not sufficient* to become him on a new device (see
   FD-S2, FD-S4).
3. **No one may *become* the Member.** Not an employer, recruiter, or labour agent — and not the
   Operator. The Operator may **restore access *for* him**, audited; never silently **act *as*** him
   (Article XVIII).
4. **The employer has no role in sessions, at all** (FD-S7, Founder-approved). No employer-initiated
   login, no employer-held credential, no shared-device path, no role in recovery. (Employer access to
   *data* is the separate, default-no consent flow — Membership FD-7.)
5. **A lost or stolen device can be cut off** and its session ended, so a found phone is not a way in.
6. **Every issuance and every recovery is logged, attributable, and reviewable**, and the Member can
   see who got into (or helped him into) his account (Article XV; Article XVIII).
7. **A woman's recovery never forces a male into the loop** (FD-11).

## 4. User journeys

- **J-S1 — His first session (the device becomes his).** At onboarding, on **his** device, the
  **Operator assists** the first session in person and it begins, **bound to that device** (FD-S1,
  approved — "software follows operations", Article X; Membership [A3]). Routine re-proof later is
  **phone-first** (J-S2).
- **J-S2 — Being known (returning).** He opens the app and is himself; no login chore. Now and then he
  is asked to re-prove, gently and phone-first (Book VIII §1.3). *How often* is **operating policy**,
  not product (per the no-operational-parameters principle); the *shape* (an occasional event, never a
  password wall) is product — see Q-S1.
- **J-S3 — A new device (he changed phones).** He proves himself; where the bar is higher this is
  **Operator-assisted** (FD-S2). The new device becomes his bound device and the **old device is signed
  out** (FD-S3). *(This resolves the open item the Membership spec parked: "re-establishing identity on
  a new device" — Membership §6 edge 6 / §13.)*
- **J-S4 — A changed SIM / new number (same person).** A number change is **expected**, not suspicious
  (Book II §1.5), but it is handled **only through assisted recovery** (FD-S4, approved) — the Operator
  in the loop, the same human-mediated shape as a lost phone (J-S5). A number change **never** continues
  or grants a session on its own. *(Engineering Readiness flags the friction this adds for a common
  event — §14.)*
- **J-S5 — Lost or stolen phone (human-mediated recovery).** From any other channel he reaches his
  **Operator in one tap** (Book IV §3.6, §4.9; Book II §4.7). The lost device is **cut off**; he is
  restored on a new device with a **known human in the loop**; the whole recovery is **logged and
  reviewable** (Article XVIII). He is back in, ideally the same day, and **no one else could have been**.
- **J-S6 — A woman Member recovers.** Exactly J-S5, but the human in the loop is a **woman
  point-of-contact**, reachable in one tap; recovery never routes through a male Operator (FD-11).
- **J-S7 — Someone else presents his number (impostor / agent-held SIM).** Default-deny on number
  alone; any new-device access runs the human-mediated bar (FD-S2). The genuine Member is not locked
  out; the impostor does not get in.

## 5. States

A session's product lifecycle is **per device**. (Member-facing language matters more than the names.)

- **No session** *(default)* — nothing is accessible; default-deny (Book VIII §1.4).
- **Active** — this device, in his hands, is him; **device-bound**. All his surfaces open without a chore.
- **Needs re-proof** — a gentle, occasional, phone-first check before continuing (Book VIII §1.3).
- **Ended** — the session is over: he signed out, he moved to a new device (J-S3), or a lost device was
  cut off (J-S5). A re-entry needs a fresh session.
- **Locked out → Recovering** — he cannot prove it on this device; **human-mediated recovery** runs
  (J-S5/J-S6). Recovery always has a path; a Member is **never permanently** locked out of what is his.

| From | To | Trigger | Nia OS / decision |
|---|---|---|---|
| No session | Active | **Operator-assisted** first session at onboarding, on his device | Book VIII §1.3 — **FD-S1 ✓** |
| Active | Needs re-proof | Occasional gentle check (cadence is **policy**) | Book VIII §1.3; §6.3 |
| Needs re-proof | Active | Phone-first re-proof succeeds | Book VIII §1.3 |
| Active | Ended | Member signs out, or moves to a new device, or device is cut off | §4.7 (lost phone); FD-S3 |
| Active / Ended | Locked out → Recovering | He cannot prove it; lost/stolen phone, or any number change | Book II §4.7; Article XVIII; **FD-S2 ✓**, **FD-S4 ✓** |
| Recovering | Active (new device) | **Human-mediated** recovery completes, audited; old device ended | Article XVIII — **FD-S2 ✓**, authority **FD-S5 ✓**, one device **FD-S3 ✓** |
| any | Ended (forced) | Membership reaches `Closed` (Off-boarding) | §4.8 — boundary (§13) |

**Device binding** holds across every Active state: the session means *this device is him*, never
*this number is him*. Durations — how long Active lasts, re-proof cadence, the lost-phone cut-off
window — are **operating policy, not product** (per the no-operational-parameters principle; cf.
Membership FD-5).

## 6. Edge cases

1. **Changed SIM, same phone.** Expected (Book II §1.5), but handled **through assisted recovery**
   (FD-S4, approved) — a number change never continues a session on its own, even on the bound device.
2. **Same number, new phone.** A new-device event (J-S3) — number alone is insufficient; the higher
   bar applies (FD-S2).
3. **Number later reassigned by the telco to a stranger.** The stranger holding the number must
   **never** reach his account — the reason the number alone never authenticates (security boundary 2).
4. **Shared / family phone.** One bound device is one person's session (FD-S3). A shared device is a
   safety risk; the "sign out — this isn't my phone" action must be easy (Q-S4).
5. **Two devices (e.g. a feature phone + a smartphone).** **One** bound device (FD-S3, approved);
   multi-device is deferred (Q-S3).
6. **Abroad / roaming / no SMS.** A phone-first code may not arrive. The **Operator path** must work
   without it (Book II §4.7) — recovery cannot depend solely on receiving an SMS (FD-S2).
7. **Prospective (phone captured, not yet a Member).** Whether a Prospective holds any session, or only
   an **onboarding-scoped** access until the first-Saturday birthday, is a **boundary with Onboarding**
   (Membership FD-3, FD-8) — **open as FD-S8** (see §9, §14); must be closed before Lock.
8. **Paused Member (Trip Home).** A Paused Member is still himself and may still sign in to see what is
   his; Paused affects the *relationship*, not *access*. (Boundary with Membership — §13.)
9. **Coerced access (an agent forces him to open the app).** A dignity/safety matter; the one-tap
   Operator path and an easy sign-out are the product responses (Article XVIII; §5.4). Deeper duress
   handling is **out of scope** here (Future Extension).

## 7. Success criteria (in Member terms)

- *"I open the app and I'm me."* No daily login chore.
- *"I lost my phone and got back in the same day, through my Operator — and no one else could."*
- **No Member is ever permanently locked out** of his own money and standing.
- **No non-Member ever became a Member** through the session path (no impostor, no agent, no employer).
- **A woman recovered access without a male in the loop.**
- He can **see**, in plain language, every time his account was accessed or recovered, and by whom
  (Article XV).

## 8. Assumptions (to confirm or correct)

- **[A-S1]** The Member's **phone is the primary device**; the session is phone-first (Book VIII §1.3).
- **[A-S2]** **One active Membership per person** (carried from Membership [A2]); this spec assumes **one
  bound device at a time** as the default (revisited in FD-S3).
- **[A-S3]** The **Operator is reachable out-of-band** when the Member is locked out (another phone, the
  Studio, a known human) — otherwise a lockout would be terminal, which violates §4.7. Recovery depends
  on this.
- **[A-S4]** **Identity facts** the session relies on (verified phone, nominee, emergency contact, the
  woman point-of-contact) are **captured by Onboarding**, not here (Book IV §4.1; §13 boundary).
- **[A-S5]** A Member can be **reached by his number for a routine phone-first check** while he still
  holds the device; recovery does **not** assume this (see edge 6).

## 9. Founder decisions

**FD-S1–FD-S7 are RESOLVED (Founder, 2026-06-30).** FD-S8 was surfaced during approval and remains
**open** (it is the strawman's original Prospective question; see the numbering note). Each resolution
is now a binding part of the spec.

> **Numbering note.** The Founder's approved **FD-S7** records the **employer** decision. The strawman's
> original FD-S7 — *does a Prospective hold a session?* — is **renumbered FD-S8** and is the one
> remaining open item, carried into the Engineering Readiness Review (§14).

- **FD-S1 — First session: operator-assisted, phone-first thereafter. ✓ RESOLVED.** The **first**
  session is **Operator-assisted during onboarding** (in person, "software follows operations",
  Article X; Membership [A3]); **routine re-proof later is phone-first** (Book VIII §1.3). *(This is the
  hybrid; the books fix the token shape but not the flow, so it was the Founder's call.)*
- **FD-S2 — Recovery is human-mediated; never number-alone. ✓ RESOLVED.** Becoming oneself on a **new**
  device after a lost/stolen phone runs **Operator-mediated human verification** (Book II §4.7; Article
  XVIII). A number or SMS code **alone never** authenticates a new device — the floor that stops an
  agent/impostor while keeping a genuine Member recoverable.
- **FD-S3 — One active bound device. ✓ RESOLVED.** A Member has **one** bound device at a time; binding
  a new device **ends** the prior session (a lost phone cannot stay signed in). Multi-device is deferred
  (Q-S3).
- **FD-S4 — A phone-number change goes only through assisted recovery. ✓ RESOLVED.** Any number change
  — even a new SIM on the same phone — is handled **only through assisted recovery** (the Operator in
  the loop). A number change **never** continues or grants a session on its own. *(Stricter than the
  strawman's "lighter path on the bound device"; chosen against the reassignment/SIM-swap risk.)*
- **FD-S5 — The Operator may restore access, never impersonate the Member. ✓ RESOLVED.** The Operator
  **restores access *for*** the Member; he may **never act *as*** the Member, nor see what the Member
  alone may see. Every recovery is **named, attributable, reviewable** (Article XVIII), and a woman
  recovers through a **woman point-of-contact** (Membership FD-11). *(The exact audit floor — what is
  recorded and shown — is surfaced in §14.)*
- **FD-S6 — Member copy is simple. ✓ RESOLVED.** The approved primary string is **"This phone is now
  your Nia phone."** The rest of the session/recovery copy follows that plain, simple tone (final
  wording per the Founder, in each language; §3).
- **FD-S7 — The employer has no role in login or recovery. ✓ RESOLVED.** No employer-initiated login,
  no employer-held credential, no shared-device path, **no role in recovery** — none. (Employer access
  to *data* remains the separate, default-no consent flow, Membership FD-7; that is not authentication.)
- **FD-S8 — Does a Prospective hold a session? ✗ OPEN (renumbered from the strawman's FD-S7).** Either a
  Prospective has **no** session until the first-Saturday birthday (access is onboarding-scoped), or a
  limited Prospective session exists. *Strawman leans:* **no full session until Member**. This is a
  boundary with Onboarding (Membership FD-3, FD-8) and **must be resolved before Engineering Lock** (§14).

## 10. References to Nia OS

Primary sources. **Book VIII** — §1.3 (phone-first, device-bound session; issued after phone
verification; human-mediated, audited recovery), §1.4 (default-deny), §1.5 (server time), §1.7
(idempotency on mutating actions — relevant only post-Lock), §4.1 (the Member's language). **Book II**
— §1.1 (women Members), §1.5 (migration; phone/SIM churn), §3.6 (he leaves rather than complain), §4.7
(lost phone, reachable through the Operator), §5.4 (dignity/privacy), §6.3 (no gamification), §6.5
(data minimisation). **Book IV** — §3.6, §4.9 (Operator one tap away). **Book I** — Article X (software
follows operations), Article XV (data ownership; every access logged and inspectable by him), Article
XVIII (Operator authority; logged, reviewed within 48h). **Neighbouring spec:** Membership FD-3, FD-7,
FD-8, FD-9, FD-11, and §6 edge 6 (the "new device — open" item this spec closes). Where a trace did not
exist (the *flows*: issuance, recovery bar, device count), the item was moved to **Founder Decisions**,
not invented.

## 11. Questions Product Should Debate

Competing product directions, not Founder decisions. Options given; none recommended unless Nia OS
already answers it.

- **Q-S1 — The *shape* of re-proof.** As an occasional, friendly **event** vs an ambient, near-invisible
  check. *Why it matters:* too frequent reads as distrust (collides with §6.3, §3.6); too rare widens
  the lost-phone window. *(The cadence number is policy; the felt shape is product.)*
- **Q-S2 — Biometric convenience (fingerprint/face) where the device supports it.** *Trade-off:*
  effortless and literacy-free, but unavailable on basic phones — must be a **convenience layer, never
  required**, or it excludes (Book II §1.1 inclusion; `nia-low-income-design`).
- **Q-S3 — Multi-device. → Deferred by FD-S3 (one bound device).** Re-opens only if FD-S3 is revisited;
  recorded here so the trade-off (a feature phone *and* a smartphone, or a shared family phone) is not lost.
- **Q-S4 — A prominent "this isn't my phone — sign me out" action.** *Trade-off:* a strong safety tool
  for sold/lost/shared phones vs one more control on a simple surface. Pairs with edge cases 4 and 9.

## 12. Future Extensions

Recorded possibilities only — **not backlog, not commitments**; each needs its own Founder/Product
decision to enter scope.

- **FE-S1 — Passkeys / device-native passwordless** once Members' devices mature — stronger and still
  passwordless (extends Book VIII §1.3).
- **FE-S2 — Offline-tolerant session** for low-connectivity corridors, so a dead network does not read
  as a lockout.
- **FE-S3 — Trusted-person recovery** — a **nominee** or a known Member vouches, *in addition to* the
  Operator (uses the nominee captured at onboarding, Membership FD-13). Widens recovery beyond a single
  human.
- **FE-S4 — Cross-corridor session continuity** — his known-on-this-device relationship travels with
  him across corridors (pairs with Membership FE-3).
- **FE-S5 — Duress / coercion handling** beyond sign-out and the Operator tap (edge 9) — a deliberate
  safety design, deferred.

## 13. Boundary Contracts

This spec owns the **session** and **access recovery**; neighbours own identity, the relationship, the
Operator, and exit. Each transition is owned by exactly one spec; the neighbour references it.

**What enters (Member Session)**

| Enters | From | As |
|---|---|---|
| A verified phone + a Member to whom the device belongs | **Onboarding** | The trigger for the **first** session (`No session → Active`), at the in-person onboarding moment |
| The Member↔Operator relationship (a known, reachable human) | **Membership / Operator** | The human who performs assisted login (FD-S1) and recovery (FD-S2/FD-S5) |
| The woman point-of-contact fact | **Onboarding / Membership (FD-11)** | The human a woman's recovery routes to |
| `Member → Closed` (a Membership has ended) | **Membership / Off-boarding** | The trigger to **force-end** all sessions |

**What leaves (Member Session)**

| Leaves | To | As |
|---|---|---|
| "This Member cannot access — human recovery needed" | **Operator** experience | A request for the known human to step in (this spec owns the *session* outcome, not the Operator's console) |
| "A device was lost / cut off" | (security/audit only) | A recorded, reviewable event the Member can inspect (Article XV) — no product behaviour handed onward |
| A resolved Member identity on each request | **every other surface** (Wallet, Membership, …) | "this device is Member X" — the input those specs already assume (default-deny without it) |

**Who owns each transition**

| Transition | Owner | Notes |
|---|---|---|
| `No session → Active` (first session) | **Member Session** | Fires on Onboarding's verified-device signal; issuance model *FD-S1* |
| `Active ↔ Needs re-proof → Active` | **Member Session** | Cadence is operating policy |
| `Active/Ended → Active (new device)` | **Member Session** | New-device bar *FD-S2*; old device ends *FD-S3* |
| `→ Locked out → Recovering → Active` | **Member Session** | Operator-mediated; authority/audit *FD-S5* |
| `any → Ended (forced)` on `Member → Closed` | **Membership / Off-boarding** owns the *Closed*; **Member Session** ends sessions on that signal | Session does not decide closure; it reacts to it |
| Identity **capture** (phone, nominee, emergency & woman contacts) | **Onboarding** | Session consumes these facts; never captures them |
| The **Operator** as an institution and his console | **Operator/Membership** spec | This spec only *invokes* the human at the boundary |
| **Employer** involvement | **— (none)** | The employer has **no** transition here; a security boundary, stated to keep the gap from drifting |

A boundary contract names *what crosses the line and who owns it* — never how the neighbour behaves
inside its own spec.

## 14. Engineering Readiness Review (Spec Phase 3 — prepared 2026-06-30)

Reviewing the Founder-approved spec **as Engineering**, per `SPEC-TEMPLATE.md` Phase 3: this section
**surfaces concerns; it does not solve them.** Each item is raised for the Founder/Product to resolve
(or to confirm an engineering note); the AI Engineer decides none of them. **The spec is not
Engineering-Locked until the "blocks Lock" items below are closed.**

### A. Blocks Engineering Lock — needs a Founder/Product ruling

- **ERR-1 — FD-S8 is open (missing decision).** Whether a Prospective holds a session, or only
  onboarding-scoped access, is undecided. Engineering cannot draw the `No session → Active` boundary
  without it. *Resolve FD-S8.*
- **ERR-2 — Out-of-band recovery reachability ([A-S3]) is an assumption, not a guarantee (impossible
  behaviour if false).** Recovery (FD-S2) routes through the Operator, but a locked-out Member has, by
  definition, lost his device. If he *also* cannot reach the Operator (no second channel), recovery
  stalls and "never permanently locked out" (§7) fails. *What is the guaranteed second channel?*
- **ERR-3 — FD-S4 friction on a common event (privacy/UX risk).** "Any number change → full assisted
  recovery" applies to a mere SIM swap on the **same** phone — frequent for migrant workers (Book II
  §1.5). This may collide with "he leaves rather than complain" (§3.6). *Confirm the friction is
  intended, or define a lighter same-device path.*
- **ERR-4 — "Restore, not impersonate" (FD-S5) needs a testable line + audit floor (audit/privacy).**
  The product rule is clear in spirit, but engineering needs the boundary made concrete: during
  recovery, **what may the Operator see and do, what may he never see**, and **exactly what the Member
  is shown** about it afterward. *Define the line and the Member-visible audit record.*
- **ERR-5 — Woman point-of-contact availability (FD-11) (missing edge).** Recovery routes a woman
  Member to a woman contact; the spec does not say what happens if that contact is **unavailable** at
  recovery time. *Define the fallback that still honours FD-11.*
- **ERR-6 — Onboarding handoff for FD-S1 (boundary dependency).** "Operator-assisted first session"
  needs a defined trigger/handoff from **Onboarding** (the verified-device moment). Onboarding is a
  separate, not-yet-locked spec; the `Enters` row in §13 names a signal that does not yet exist.
  *The Onboarding boundary must be agreed before this can be built.*
- **ERR-7 — Paused-member access (edge 8) needs Membership confirmation (consistency).** The spec
  assumes a Paused Member retains sign-in. *Confirm with the Membership spec that Paused affects the
  relationship, not access.*
- **ERR-8 — Q-S4 is now safety-relevant, not just a debate.** With one bound device (FD-S3), an easy
  "this isn't my phone — sign me out" action materially changes the lost/sold-phone story. *Decide
  Q-S4 (it is still an open Question), as it affects the lost-phone journey.*

### B. Engineering will handle in the Implementation Plan (no Product decision needed — flagged for planning)

- **ERR-9 — Contract additions.** The `MemberSession` scheme (token shape) exists; the **issuance and
  recovery operations do not.** Building them is post-Lock and will add contract paths + regenerate
  clients (ADR-0007). No product input needed.
- **ERR-10 — Mutating actions need idempotency (Book VIII §1.7)** and must reason on **server time
  (§1.5)**. Implementation detail; noted for the plan.
- **ERR-11 — The session *boundary* already exists** (`@nia/runtime`: opaque token → Member,
  default-deny). Issuance must **write into** that store; "cut off a lost device" implies a revocation
  capability the in-memory store does not yet have. Engineering scope, no product decision.
- **ERR-12 — "Device binding" mechanism is engineering.** The product guarantee is "*this device is
  him*"; how a device is identified/bound is an implementation choice, not a spec concern. Noted so it
  is not mistaken for an open product question.

### C. Carried after Lock (not blockers)

- Member-facing copy beyond the FD-S6 primary string (final wording per the Founder, in each language).
- The Questions left open for Product debate (Q-S1, Q-S2; Q-S3 deferred by FD-S3; Q-S4 → ERR-8).

---

## Next process step (not part of the spec)

Per the four-phase lifecycle (`SPEC-TEMPLATE.md`): Strawman ✓ → **Founder Review ✓** → **Engineering
Readiness Review ✓ (this §14)** → **Engineering Lock** (pending). Lock requires closing **ERR-1…ERR-8**
(and FD-S8). **Only after Lock** does engineering plan and build the session **issuance** surface
(`POST /v1/sessions`) and the recovery flow. The server-side session **boundary** (opaque token →
Member, default-deny) is already built (`74f774a`) and is unaffected by this spec until Lock.
