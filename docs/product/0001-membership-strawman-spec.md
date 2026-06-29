# Strawman — Membership Product Specification

| | |
|---|---|
| **Status** | DRAFT — Strawman for Founder/Product review. **Not a product decision.** |
| **Phase** | 1 — Problem definition (product). No implementation, APIs, data models, or architecture. |
| **Owner** | Founder / Product (to review, correct, and own) |
| **Drafted by** | AI Engineer, as a starting point to reduce blank-page work |
| **Date** | 2026-06-29 |
| **Derived from** | Nia OS only. Every behaviour cites the section that justifies it. |

> How to read this. Everything here traces to Nia OS. Where the books are silent, this
> document **stops** and records the question under **Founder Decisions Required** — it
> does not invent policy. Assumptions are marked **[A#]** and are not facts. This is a
> proposal for Product to correct, not a decision made on Product's behalf.

---

## 1. Scope

**In scope** — the meaning of Membership and the membership *relationship* itself:
- what Membership is, and the promise attached to it;
- the membership lifecycle: its states and the transitions between them;
- the Member's identity (the product view — not data models);
- tenure and continuity;
- the Member's data-ownership rights as experienced;
- the Member's conduct, restoration, and exit *at the membership level*.

**Out of scope** (separate specifications / later sessions). Membership defines the
states these flows move *between*, and references them only at the boundary:
- the Onboarding *experience* — the 72-hour creation flow (Book IV §4.1; Book VII ch. 2);
- the Wage, Remittance, Savings, and Curry flows (Book IV §4.2–4.5);
- the Trip Home *experience* (Book IV §4.7);
- the detailed Off-boarding *experience* (Book IV §4.8; Book VII 9.3).

The exact scope boundary is itself a decision — see **FD-1**.

---

## 2. The Member problem this solves

The Member's economic life is illegible to him. His wage records sit with the employer,
his attendance with the contractor, his savings with the post office, his remittance
with the rail of the month — "His own economic life is illegible to him" (Book II §4.8).

He has no institution that travels with him. His working life is not one migration but
"six to ten migrations across thirty-five years" (Book II §1.5), and "a platform that
travels with him across corridors" is the one that has served him (Book II §1.5).

**Membership is the answer to both.** It is the continuing relationship that makes the
Member legible to himself and keeps Nia with him across his working life. "Nia's first
act of value, before any product, is to assemble his data and show it back to him in a
form he can read… That assembly is the platform" (Book II §4.8).

---

## 3. What Membership is

- **Membership is the product.** "Nia does not sell housing, groceries, employment, or
  software. Every other line item is a benefit of Membership" (Book I, Article I).
- **Definition.** "The continuing relationship between the Member and Nia. Measured in
  months. Lost in days" (Book I §4.10).
- **The spine.** "There is no Nia experience that exists outside Membership… A Member is
  created by an onboarding flow. A Member is sustained by the continuity flows. A Member
  is closed by the off-boarding flow" (Book IV §1.1).
- **The Member is the customer.** When the interests of employer, capital partner, or
  investor conflict with the Member's, "the Member wins" (Book I, Article XII).
- **The Promise.** Each Member sees "a short, written statement of what a Member can
  expect from Nia in the next thirty days… The Promise is the same across Nia" (Book I
  §4.19). *The wording of The Promise is a business statement — see FD-2.*

---

## 4. Behavioural principles governing Membership

Each principle is a binding behaviour the membership experience must honour.

| Principle | Behaviour | Nia OS |
|---|---|---|
| Known by name, not number | The Member is addressed by name everywhere; never by an ID or account number | Book I §4.16, Truth 1.7; Book III (voice) |
| Predictability over surprise | No surprise change to a Member's price, feature, or policy | Book I, Article V |
| The Member wins | Conflicts of interest resolve for the Member | Book I, Article XII |
| Defaults beat prompts | Membership defaults are set by Nia and are overridable; most Members never change them | Book I, Article VII |
| Failures are private | A Member's missed payment, withdrawn goal, or returned product is never shown to other Members | Book II §5.4 |
| Measured by exit, not complaint | Membership health is read from continuity and exit, not tickets | Book II §3.6; Book I, Article IV |
| One Floor for everyone | No premium vs basic Membership; every Member gets the same Floor and dignity | Book IV §6.7 |
| Continuity, not retention | In Member-facing language we say continuity; "retention" is internal only | Book I §4.13 |
| A human in one tap | The Member can reach his Operator — a named human — within one tap from any screen | Book IV §3.6, §4.9 |
| Sunday is the Member's | Nia does not initiate contact on a Sunday (except a P0 emergency or a Member-requested confirmation) | Book IV §5.4 |

---

## 5. The membership lifecycle

Nia OS names the underlying membership states **pending, active, paused, closed**
(referenced here as the canonical state vocabulary only). In Member-facing terms:

- **Prospective** *(pending)* — a person Nia intends to serve, met at the station, gate,
  or Studio door (Book IV §4.1). Not yet a Member; the guarantees of Membership do not
  yet apply.
- **Member** *(active)* — the continuing relationship is live; every guarantee of
  Membership applies; **tenure accrues** (Book I §4.11).
- **Paused** *(paused)* — Membership is intact but dormant by an agreed event, primarily
  the Trip Home (Book IV §4.7). Guarantees are held; the Nest is held (≤15 days at
  half-rate), Curry is paused without penalty. *Tenure treatment while paused — see FD-5.*
- **Closed** *(closed)* — the relationship has ended through off-boarding (Book IV §4.8).
  The exit is dignified and fast; the Member's record is retained 90 days in case he
  returns.

**Restoration** is not a state but a *process* (Book I, Article XVII): a Member in breach
is returned to good standing **before** any question of removal arises.

---

## 6. User journeys (product level)

### J1 — Becoming a Member
Creation begins wherever the Member first meets Nia — railway station, factory gate, or
Studio doorway (Book IV §4.1). The relationship becomes **Member (active)** when the
onboarding completion criteria are met: a Nest assigned, bed made, locker keyed, wage
account opened, first remittance sent, first Curry eaten, Operator known by name, and a
photograph of the Nest sent to his family (Book IV §4.1). Onboarding "ends at the first
Saturday after move-in. Not before" (Book I §4.12). *The exact moment tenure begins is
not fixed by the books — see FD-3.*

Only the minimum identity required to deliver Membership is collected: name, phone,
employer (if relevant), wage account, language, home address at state/district level,
emergency contact, and the photograph for the Nia card. No Aadhaar or biometric data
unless a specific compliance flow requires it (Book IV §6.5; Book I, Article XV).

**[A1]** Membership is held by an individual Member; the family is treated as part of
the Member, not as a separate Member (Book II §6.1). **[A2]** A person holds one active
Membership at a time. **[A3]** In early production, creation is Operator-mediated rather
than self-serve, because "software follows operations… we do not ship the app before we
have run the corridor" (Book I, Article X).

### J2 — Being a Member (the continuing relationship)
The Member can draw his whole map from memory after three months: Home, My Wallet, My
Living, My Work, My Essentials, My Family, RafiQi (Book IV §2.2). He always knows who his
Operator is and can reach him in one tap (Book IV §3.6). He sees The Promise — what to
expect in the next thirty days (Book I §4.19). His assembled history is shown back to him,
and a balance he can see comes before any feature that takes money from him (Book II §4.8;
Book I, Article II). **Tenure accrues month by month** and is "the most predictive number
Nia tracks" (Book I §4.11). The Membership itself never tiers (Book IV §6.7).

### J3 — The Member's data rights
The Member owns his data; Nia is custodian, not owner (Book I, Article XV). As experienced,
this means: he can see his full history; every access to his record by any non-Member
actor is logged and is inspectable by him; a request for his data from an employer,
recruiter, government department, or capital partner defaults to **no**; and any consent
he gives is "in writing, in his language, by name, in the current month." He may ask to be
forgotten — his personal details are removed while the trail of past activity remains for
integrity. *The product mechanics and renewal cadence of consent — see FD-7.*

### J4 — When the Member breaks the rules
"A Member who misses a payment, skips a shift, breaks a Nest fitting, fights with a
roommate, or arrives drunk has not stopped being a Member" (Book I, Article XVII). A
**restoration process runs first**; the relationship is restored before it is removed. A
Member is removed only when he chooses to leave, or when his continued presence "would
violate the dignity of other Members." In an emergency, "the Operator's call stands," is
logged, and is reviewed within forty-eight hours (Book I, Article XVIII). *The restoration
processes themselves, and the due process for a dignity-based removal, are business policy
— see FD-9 and FD-10.*

### J5 — Pausing (Trip Home) — boundary
Membership moves to **Paused** when the Member declares a trip home: the Nest is held
(≤15 days at half-rate), Curry is paused without penalty, wage and remittance schedules
adjust, and the family is told he is on his way; the return reverses all of it (Book IV
§4.7). The internal experience of this flow is the Trip Home spec. *Whether Membership can
pause for reasons other than a trip home, and any maximum pause duration, are open — see
FD-4 and FD-5.*

### J6 — Leaving (Off-boarding) — boundary
Membership moves to **Closed** with dignity and speed: the Wallet is settled within
forty-eight hours, locked savings are transferred to the Member's bank account or a
remittance, a closing statement is sent by SMS and print, and the record is retained 90
days. "Nia does not run a retention prompt… does not run a 'are you sure?' screen designed
to manipulate… does not slow the off-boarding by even one hour" (Book IV §4.8). The
detailed experience is the Off-boarding spec.

### J7 — Returning
The Member migrates six to ten times across his working life (Book II §1.5); returning is
normal. "Tenure resets if the Member leaves and returns" (Book I §4.11), yet a closed
record is retained 90 days "in case he returns" (Book IV §4.8). How these two interact —
resume vs. reset for a return within 90 days — is **FD-6**.

---

## 7. State transitions (summary)

| From | To | Trigger | Nia OS |
|---|---|---|---|
| Prospective | Member | Onboarding completion criteria met | Book IV §4.1; Book I §4.12 |
| Member | Paused | Member declares a Trip Home | Book IV §4.7 |
| Paused | Member | Member returns | Book IV §4.7 |
| Member | Closed | Member declares departure (voluntary) | Book IV §4.8 |
| Member | Closed | Removal — continued presence violates others' dignity | Book I, Articles XVII, XVIII |
| Closed | Member / Prospective | Member returns (within / after 90 days) | Book IV §4.8; Book I §4.11 — *see FD-6* |
| Prospective | (lapses) | Onboarding not completed (the 72 hours fail) | Book II §1.4 — *handling is FD-8* |

Restoration (Article XVII) acts within the **Member** state to prevent a slide to Closed;
it is a process, not a transition.

---

## 8. Edge cases (product level)

1. **Onboarding not completed.** "A Member who finds a bed, a hot meal, and a paid first
   wage within seventy-two hours stays… one who does not, leaves" (Book II §1.4). A
   Prospective who never completes does not become a Member. *Handling of the lapsed
   Prospective record — FD-8.*
2. **Return within the 90-day retention window** (Book IV §4.8) — resume or reset tenure
   (FD-6).
3. **Breach during a Trip Home pause** — does restoration (Article XVII) run while Paused,
   or only on return? *Open.*
4. **Employer demands surveillance of, restriction of, or data on the Member** — refused;
   Membership is unaffected and Nia may exit the corridor rather than comply (Book I,
   Articles XIII, XV).
5. **Woman Member** — same Member, but "the dignity floor is higher, the safety floor is
   higher, and the privacy floor is higher" (Book II §1.1). *What concretely changes in the
   membership experience — FD-11.*
6. **Member loses his phone** (Book II §4.7) — he can still reach Nia through the Operator
   (Book IV §4.9); Membership is unaffected. *How identity is re-established on a new
   device — open.*
7. **Death of a Member** — closure with dignity and settlement to the family/recipient.
   *The books do not specify this process — open, and a Founder/ops decision.*
8. **No valid emergency contact at arrival** — the Member "arrives… with the name of a
   contact who may or may not still be at that address" (Book II §1.4). The membership
   experience must not block on an unreachable contact. *Open.*

---

## 9. Success criteria (in Member terms)

A behaviour, not a dashboard. Membership is working when:

1. **The relationship persists.** Continuity holds; read from tenure and exit, not tickets
   (Book II §3.6; Book I, Article IV). Tenure is the most predictive number Nia tracks
   (Book I §4.11).
2. **The Member can draw his map** after three months (Book IV §2.2).
3. **The Member is addressed by name** on every surface (Truth 1.7).
4. **The Member can see his full assembled history, and every access to it** (Book I,
   Articles II, XV).
5. **Members leave clean.** A dignified exit is the most powerful retention surface; "a
   Member who left clean tells five future Members" (Book IV §4.8).
6. **No second tier exists** (Book IV §6.7).

*Numeric targets (continuity rate, tenure goals) are economics and prioritisation, which
the methodology reserves to Founder/Product — not set here.*

---

## 10. Assumptions (to confirm or correct)

- **[A1]** Membership is individual; the family is part of the Member, not a separate
  Member (Book II §6.1).
- **[A2]** One active Membership per person at a time.
- **[A3]** Early-production membership creation is Operator-mediated, not self-serve
  (Book I, Article X).
- **[A4]** "My Family" is a *view* the Member sees (Book IV §2.2), not a separate family
  login or account.
- **[A5]** The Member-facing lifecycle names (Prospective / Member / Paused / Closed)
  correspond to Nia OS's pending / active / paused / closed.
- **[A6]** A membership number identifies the Member and is stable for the life of a
  single, continuous Membership.

---

## 11. Founder Decisions Required

Where Nia OS is silent or a business/economic ruling is needed, this document stops here.

- **FD-1 — Scope boundary.** Confirm Membership covers *lifecycle + identity + rights*,
  with Onboarding, Trip Home, and Off-boarding as separate specs — or widen it.
- **FD-2 — The Promise.** Author the actual wording of The Promise (what a Member can
  expect in the next 30 days). The books require it exists and is uniform (Book I §4.19);
  the words are a Founder/brand statement.
- **FD-3 — When tenure begins.** At move-in, at the first Saturday (Book I §4.12), or at
  first wage? The books fix the end of onboarding, not the start of tenure.
- **FD-4 — Pause reasons.** May Membership pause for reasons beyond a trip home (e.g.,
  hospitalisation, between jobs)? The books define only the Trip Home pause (Book IV §4.7).
- **FD-5 — Tenure while paused, and maximum pause.** Does tenure accrue during a pause? Is
  there a maximum pause before it becomes closure?
- **FD-6 — Return within 90 days.** Does a Member returning within the retention window
  resume tenure or reset it? (Book I §4.11 says reset; Book IV §4.8 retains the record.)
- **FD-7 — Consent experience.** The product mechanics and renewal cadence for the
  "in his language, by name, in the current month" consent (Book I, Article XV).
- **FD-8 — Lapsed Prospective.** What happens to the record of a person who began but
  never completed onboarding within the 72 hours (Book II §1.4)?
- **FD-9 — Restoration processes.** The actual "process for each" breach — missed payment,
  skipped shift, broken fitting, fight, arriving drunk (Book I, Article XVII). These are
  operational policy.
- **FD-10 — Dignity-based removal.** The due process and decision authority for removing a
  Member whose presence "would violate the dignity of other Members" (Articles XVII, XVIII).
- **FD-11 — Women Members.** What concretely is higher in the dignity, safety, and privacy
  floors of the membership experience (Book II §1.1)?
- **FD-12 — Eligibility at creation.** Is eligibility (Book II ch. 7 — who Nia does not
  serve) enforced at membership creation, and by Operator judgment or by rule?
- **FD-13 — Death of a Member.** The closure-and-settlement process on death is unspecified
  by the books.

---

## 12. Traceability note

Every behaviour above cites the Nia OS section that justifies it. Nothing in this document
is introduced that cannot be traced to the books; where a trace did not exist, the item
was moved to **Founder Decisions Required** rather than resolved. This strawman is a
proposal for Product review and carries no decision authority.
