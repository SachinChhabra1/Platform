# Strawman — Member Session & Recovery Product Specification

| | |
|---|---|
| **Status** | **DRAFT (Strawman).** Not Founder-approved; not Engineering-Locked. Resolves the brief by **tracing to Nia OS where the books decide**, and **raising a Founder Decision / Question where they are silent** — it does not invent policy. No code (incl. `POST /v1/sessions`) begins before Engineering Lock. |
| **Spec lifecycle** | **Strawman ✓** → Founder Review ☐ → Engineering Readiness Review ☐ → Engineering Lock ☐ |
| **Concept (one per spec)** | The **Member's session** — how a Member is known on his device, and how he **recovers access** when the device is lost or the number changes. Owns *access to what is his*, nothing else. |
| **Owner** | Founder / Product (to review, correct, and own) |
| **Drafted by** | AI Engineer, to reduce blank-page work (helping Product think; not deciding) |
| **Date** | 2026-06-30 (rev. 1 — strawman) |
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
| Employer role | §3 *Security boundaries* (none) · §13 Boundary Contracts |
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

### Member-facing copy *(illustrative, in the Member's language; exact wording is a Founder copy item — see FD-S6)*

- First session: *"This phone is now yours with Nia. We'll send a code to your number to be sure it's
  you."*
- Routine re-proof: *"Quick check — it's still you? We've sent a code to your number."*
- Lost phone (from another channel / a new device): *"Lost your phone? Your Operator will help you get
  back in. No one else can."*
- New device: *"New phone? Let's move you over. Your old phone will be signed out."*
- Reassurance, always present: *"Only you can get into your Nia. Not your employer, not an agent — only
  you, and your Operator can help you back in."*

### Security boundaries *(product-level guarantees — the "must never happen", not mechanism)*

1. **Default-deny.** No valid session, no access (Book VIII §1.4).
2. **The number alone never authenticates a new device.** Because numbers are reassigned and SIMs
   swapped, a verified number is *necessary but not sufficient* to become him on a new device (see
   FD-S2, FD-S4).
3. **No one may *become* the Member.** Not an employer, recruiter, or labour agent — and not the
   Operator. The Operator may **restore access *for* him**, audited; never silently **act *as*** him
   (Article XVIII).
4. **The employer has no role in sessions, at all.** No employer-initiated access, no employer-held
   credential, no shared device path. (Employer access to *data* is the separate, default-no consent
   flow — Membership FD-7.)
5. **A lost or stolen device can be cut off** and its session ended, so a found phone is not a way in.
6. **Every issuance and every recovery is logged, attributable, and reviewable**, and the Member can
   see who got into (or helped him into) his account (Article XV; Article XVIII).
7. **A woman's recovery never forces a male into the loop** (FD-11).

## 4. User journeys

- **J-S1 — His first session (the device becomes his).** At onboarding, on **his** device, his number
  is verified and the session begins, **bound to that device**. Onboarding is already a human, in-person,
  Operator-mediated moment ("software follows operations", Article X; Membership [A3]). *How* the first
  proof is done — self-serve code, Operator-assisted, or both — is **FD-S1**.
- **J-S2 — Being known (returning).** He opens the app and is himself; no login chore. Now and then he
  is asked to re-prove, gently and phone-first (Book VIII §1.3). *How often* is **operating policy**,
  not product (per the no-operational-parameters principle); the *shape* (an occasional event, never a
  password wall) is product — see Q-S1.
- **J-S3 — A new device (he changed phones).** He proves himself; where the bar is higher this is
  **Operator-assisted** (FD-S2). The new device becomes his bound device and the **old device is signed
  out** (FD-S3). *(This resolves the open item the Membership spec parked: "re-establishing identity on
  a new device" — Membership §6 edge 6 / §13.)*
- **J-S4 — A changed SIM / new number (same person, same phone).** A number change is **expected**, not
  suspicious (Book II §1.5). On his already-bound device it may be a lighter path; a number change
  **alone** never authenticates a *new* device. The exact allowance is **FD-S4**.
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
| No session | Active | First proof at onboarding, on his device | Book VIII §1.3 — issuance model *FD-S1* |
| Active | Needs re-proof | Occasional gentle check (cadence is **policy**) | Book VIII §1.3; §6.3 |
| Needs re-proof | Active | Phone-first re-proof succeeds | Book VIII §1.3 |
| Active | Ended | Member signs out, or moves to a new device, or device is cut off | §4.7 (lost phone); FD-S3 |
| No session / Ended | Active (new device) | New-device proof — higher bar, Operator-assisted | *FD-S2* |
| Active / Ended | Locked out → Recovering | He cannot prove it; lost/stolen phone | Book II §4.7; Article XVIII |
| Recovering | Active (new device) | Operator-mediated recovery completes, audited | Article XVIII — bar *FD-S2*, authority *FD-S5* |
| any | Ended (forced) | Membership reaches `Closed` (Off-boarding) | §4.8 — boundary (§13) |

**Device binding** holds across every Active state: the session means *this device is him*, never
*this number is him*. Durations — how long Active lasts, re-proof cadence, the lost-phone cut-off
window — are **operating policy, not product** (per the no-operational-parameters principle; cf.
Membership FD-5).

## 6. Edge cases

1. **Changed SIM, same phone.** Expected (Book II §1.5). On the bound device, a lighter path may apply
   (FD-S4); it is **not** a new-device event.
2. **Same number, new phone.** A new-device event (J-S3) — number alone is insufficient; the higher
   bar applies (FD-S2).
3. **Number later reassigned by the telco to a stranger.** The stranger holding the number must
   **never** reach his account — the reason the number alone never authenticates (security boundary 2).
4. **Shared / family phone.** One bound device is one person's session (FD-S3). A shared device is a
   safety risk; the "sign out — this isn't my phone" action must be easy (Q-S4).
5. **Two devices (e.g. a feature phone + a smartphone).** Default is **one** bound device (FD-S3);
   multi-device is deferred (Q-S3 / FE-S?).
6. **Abroad / roaming / no SMS.** A phone-first code may not arrive. The **Operator path** must work
   without it (Book II §4.7) — recovery cannot depend solely on receiving an SMS (FD-S2).
7. **Prospective (phone captured, not yet a Member).** Whether a Prospective holds any session, or only
   an **onboarding-scoped** access until the first-Saturday birthday, is a **boundary with Onboarding**
   (Membership FD-3, FD-8) — raised as FD-S7.
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

## 9. Founder decisions required

Only the Founder can make these; they are **not** resolved here. Each carries a **strawman proposal**
to react to, not a decision made on Product's behalf.

- **FD-S1 — How the first session is issued: OTP vs assisted login.** The books fix the *token shape*
  ("issued after phone verification with device binding", Book VIII §1.3) but **not** the *flow*.
  Options:
  - **(a) Self-serve phone code (OTP).** The Member receives a code on his number and enters it.
    *Trade-off:* scalable and familiar; but assumes he can receive/read/enter a code, and trusts the
    SMS channel.
  - **(b) Operator-assisted.** The Operator, present at onboarding, verifies him in person and starts
    the session with him. *Trade-off:* highest first-touch trust and inclusion for low-literacy Members
    ("software follows operations", Article X; Membership [A3]); but human-bound, less scalable.
  - **(c) Hybrid — assisted first, phone-first after.** Operator-assisted at the **first** session
    (onboarding is already in-person), self-serve phone-first for routine re-proof and ordinary
    new-device moves. **← Strawman proposes (c)**, grounding the first touch in Article X and routine
    proof in Book VIII §1.3. *Founder to decide.*
- **FD-S2 — The recovery / new-device bar.** What must a Member present to become himself on a **new**
  device after a lost phone? The bar must stop an agent/impostor **without** locking out a genuine,
  low-literacy Member who lost everything. *Strawman:* **Operator-mediated human verification is the
  floor** for new-device and lost-phone recovery (Book II §4.7; Article XVIII); **never number-alone**.
  Whether a phone-first code can ever *substitute* for the human (e.g. abroad) is part of this decision.
- **FD-S3 — Device-binding strictness & device count.** Default **one** bound device at a time, and a
  new bound device **ends** the old session (so a lost phone cannot stay signed in). *Strawman:* adopt
  one-device + auto-sign-out-old. *Founder/Product to confirm*, given shared/feature-phone realities
  (Q-S3).
- **FD-S4 — What a number change *alone* may do.** Given SIM churn *and* reassignment, may a verified
  new SIM on the **already-bound device** keep the session (lighter path), or does any number change
  require Operator re-binding? *Strawman:* on the bound device, a verified new number may continue the
  session; on a **new** device it never suffices (FD-S2). *Founder to weigh convenience vs reassignment
  risk.*
- **FD-S5 — Operator authority in recovery (and the woman-Member path).** The Operator **restores
  access for** the Member but must not be able to **act as** him or see what he should not; every
  recovery is **named, attributable, reviewable** (Article XVIII), and a woman recovers through a
  **woman point-of-contact** (FD-11). *Confirm the exact authority and its audit floor.*
- **FD-S6 — Member-facing copy.** Exact session/recovery wording, in each supported language, is a
  Founder copy item (as FD-2 was for the Promise). The §3 copy is **illustrative** pending ratification.
- **FD-S7 — Does a Prospective hold a session?** Either a Prospective has **no** session until the
  first-Saturday birthday (access is onboarding-scoped), or a limited Prospective session exists.
  *Strawman:* **no full session until Member**; onboarding-scoped access only (boundary with Onboarding;
  Membership FD-3, FD-8). *Founder to confirm the boundary.*

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
- **Q-S3 — Multi-device.** A worker with a feature phone *and* a smartphone, or a shared family phone.
  *Trade-off:* convenience vs the safety and simplicity of one bound device (FD-S3).
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

---

## Next process step (not part of the spec)

Per the four-phase lifecycle (`SPEC-TEMPLATE.md`): **Founder Review** (resolve FD-S1…S7, weigh
Q-S1…S4) → **Engineering Readiness Review** (AI Engineer surfaces concerns) → **Engineering Lock**.
**Only after Lock** does engineering plan and build the session **issuance** surface (`POST /v1/sessions`)
and the recovery flow. The server-side session **boundary** (opaque token → Member, default-deny) is
already built and is unaffected by this spec until Lock.
