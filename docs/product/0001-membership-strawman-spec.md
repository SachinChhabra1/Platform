# Strawman — Membership Product Specification

| | |
|---|---|
| **Status** | DRAFT — Strawman for Founder/Product review. **Not a product decision.** |
| **Phase** | 1 — Problem definition (product). No implementation, APIs, data models, or architecture. |
| **Owner** | Founder / Product (to review, correct, and own) |
| **Drafted by** | AI Engineer, to reduce blank-page work (helping Product think; not deciding) |
| **Date** | 2026-06-29 (rev. 2 — conformed to `SPEC-TEMPLATE.md`) |
| **Derived from** | Nia OS only. Every behaviour cites the section that justifies it. |

> How to read this. Everything traces to Nia OS. Where the books are silent, this document
> **stops** and records the question under **Founder Decisions Required** — it does not
> invent policy. Assumptions are marked **[A#]** and are not facts. Competing product
> directions are raised under **Questions Product Should Debate** for Product to weigh.
> This is a proposal for Product to correct, not a decision made on Product's behalf.

**Scope.** In scope: the membership *relationship* — what Membership is; its lifecycle
(states + transitions); the Member's identity (product view); tenure and continuity; data
rights as experienced; conduct, restoration, and exit at the membership level. Out of
scope (separate specs, referenced only at the boundary): the Onboarding experience (Book IV
§4.1; Book VII ch. 2); Wage/Remittance/Savings/Curry flows (§4.2–4.5); the Trip Home
experience (§4.7); the detailed Off-boarding experience (§4.8). The boundary itself is
**FD-1**.

---

## 1. Problem

The Member has no continuing institution that is his, and his own economic life is
illegible to him. He cannot see, in one place, what he earns, saves, sends, and holds; and
nothing he can call his own travels with him as he moves between corridors. No durable,
accountable relationship — a **Membership** — exists between him and the institutions he
depends on.

## 2. Why the problem exists

- **His records are scattered by the informal economy.** "The wage records sit with the
  employer. The attendance records sit with the contractor. The savings records sit with
  the post office. The remittance records sit with the rail of the day… His own economic
  life is illegible to him" (Book II §4.8).
- **He migrates repeatedly and no institution follows him.** His working life "is six to
  ten migrations across thirty-five years," and "a platform that serves the first migration
  but not the second has not served the Member" (Book II §1.5).
- **Everything around him is informal and socially enforced** — his debt (§4.5), his
  savings instruments (§4.3) — so nothing holds a durable, accountable relationship with
  him over time.
- **He does not raise problems; he leaves.** "He absorbs. He waits. He leaves" (Book II
  §3.6). Without a deliberate continuing relationship, his departure is invisible until it
  is a churn number — by which point the Member is already gone.

## 3. Desired Member experience

**What Membership is.** Membership *is* the product — "Nia does not sell housing,
groceries, employment, or software. Every other line item is a benefit of Membership"
(Book I, Article I). It is "the continuing relationship between the Member and Nia.
Measured in months. Lost in days" (§4.10) — the spine, with nothing outside it (Book IV
§1.1). The Member is the customer; in conflict, "the Member wins" (Article XII). Each
Member sees **The Promise** — what to expect in the next thirty days, uniform across Nia
(§4.19; *wording is FD-2*).

**How it should feel.** Each principle below is a binding behaviour the experience must
honour:

| Principle | Behaviour | Nia OS |
|---|---|---|
| Known by name, not number | Addressed by name everywhere; never an ID or account number | §4.16, Truth 1.7; Book III |
| Legible to himself | His scattered economic life is assembled and shown back to him; a balance he can see precedes any feature that takes money | Book II §4.8; Article II |
| Predictability over surprise | No surprise change to his price, feature, or policy | Article V |
| The Member wins | Conflicts of interest resolve for the Member | Article XII |
| Defaults beat prompts | Membership defaults set by Nia, overridable; most never change them | Article VII |
| Failures are private | A missed payment, withdrawn goal, or returned product is never shown to other Members | Book II §5.4 |
| One Floor for everyone | No premium vs basic Membership; same Floor, same dignity | Book IV §6.7 |
| Continuity, not retention | Member-facing language says continuity; "retention" is internal only | §4.13 |
| A human in one tap | He can reach his Operator — a named human — within one tap from any screen | Book IV §3.6, §4.9 |
| Sunday is the Member's | Nia does not initiate contact on a Sunday (except P0 emergency or a confirmation he requested) | Book IV §5.4 |

## 4. User journeys

- **J1 — Becoming a Member.** Creation begins wherever he first meets Nia — station, gate,
  or Studio door (Book IV §4.1). He becomes a **Member** when the onboarding completion
  criteria are met: Nest assigned, bed made, locker keyed, wage account opened, first
  remittance sent, first Curry eaten, Operator known by name, Nest photo sent to family
  (§4.1). Onboarding "ends at the first Saturday after move-in. Not before" (§4.12). Only
  minimum identity is collected — name, phone, employer (if relevant), wage account,
  language, home state/district, emergency contact, photo; no Aadhaar/biometric unless a
  compliance flow requires it (§6.5; Article XV). *[A3] Early creation is Operator-mediated
  — "software follows operations" (Article X).*
- **J2 — Being a Member.** He can draw his map after three months: Home, My Wallet, My
  Living, My Work, My Essentials, My Family, RafiQi (§2.2). He always knows his Operator and
  reaches him in one tap (§3.6). He sees The Promise (§4.19). His history is shown back to
  him, balance before any money-taking feature (Book II §4.8; Article II). **Tenure accrues**
  monthly and is "the most predictive number Nia tracks" (§4.11). Membership never tiers
  (§6.7).
- **J3 — His data rights.** He owns his data; Nia is custodian, not owner (Article XV). He
  can see his full history; every access by a non-Member actor is logged and inspectable by
  him; a request for his data from employer, recruiter, government, or capital partner
  defaults to **no**; any consent is "in writing, in his language, by name, in the current
  month." He may ask to be forgotten — personal details removed, the trail of past activity
  retained for integrity. *Consent mechanics — FD-7.*
- **J4 — When the Member breaks the rules.** A missed payment, skipped shift, broken
  fitting, fight, or arriving drunk does not end Membership (Article XVII). A **restoration
  process runs first**; removal happens only if he chooses to leave or his presence "would
  violate the dignity of other Members." In emergency, "the Operator's call stands," logged
  and reviewed within 48 hours (Article XVIII). *Restoration processes — FD-9; removal due
  process — FD-10.*
- **J5 — Pausing (Trip Home) — boundary.** He moves to **Paused**: Nest held (≤15 days at
  half-rate), Curry paused without penalty, schedules adjusted, family told he is on his
  way; return reverses it (§4.7). The internal experience is the Trip Home spec.
- **J6 — Leaving (Off-boarding) — boundary.** He moves to **Closed**, dignified and fast:
  Wallet settled ≤48h, locked savings transferred, closing statement by SMS + print, record
  retained 90 days; no retention prompt, no manipulation, no slowdown (§4.8).
- **J7 — Returning.** Returning is normal (§1.5). "Tenure resets if the Member leaves and
  returns" (§4.11), yet the closed record is kept 90 days "in case he returns" (§4.8) — the
  interaction is **FD-6**.

## 5. States

Member-facing states (mapping to Nia OS's pending / active / paused / closed):

- **Prospective** *(pending)* — a person Nia intends to serve; guarantees not yet applied.
- **Member** *(active)* — relationship live; all guarantees apply; tenure accrues (§4.11).
- **Paused** *(paused)* — intact but dormant, primarily Trip Home (§4.7); *tenure treatment
  FD-5*.
- **Closed** *(closed)* — ended via off-boarding (§4.8); record retained 90 days.

**Restoration** (Article XVII) is a *process*, not a state: it returns a Member in breach to
good standing **before** any slide toward Closed.

| From | To | Trigger | Nia OS |
|---|---|---|---|
| Prospective | Member | Onboarding completion criteria met | §4.1; §4.12 |
| Member | Paused | Member declares a Trip Home | §4.7 |
| Paused | Member | Member returns | §4.7 |
| Member | Closed | Member declares departure (voluntary) | §4.8 |
| Member | Closed | Removal — presence violates others' dignity | Articles XVII, XVIII |
| Closed | Member / Prospective | Return (within / after 90 days) | §4.8; §4.11 — *FD-6* |
| Prospective | (lapses) | Onboarding not completed in the 72 hours | Book II §1.4 — *FD-8* |

## 6. Edge cases

1. **Onboarding not completed** within 72 hours (Book II §1.4) — stays Prospective, never
   becomes a Member. *Handling of the lapsed record — FD-8.*
2. **Return within the 90-day window** (§4.8) — resume or reset tenure (FD-6).
3. **Breach during a Trip Home pause** — does restoration run while Paused, or only on
   return? *Open.*
4. **Employer demands surveillance, restriction, or the Member's data** — refused;
   Membership unaffected; Nia may exit the corridor rather than comply (Articles XIII, XV).
5. **Woman Member** — same Member, but "the dignity floor is higher, the safety floor is
   higher, and the privacy floor is higher" (Book II §1.1). *What changes — FD-11.*
6. **Lost phone** (Book II §4.7) — still reachable through the Operator (§4.9); Membership
   unaffected. *Re-establishing identity on a new device — open.*
7. **Death of a Member** — closure with dignity and settlement to family/recipient. *Books
   are silent — FD-13.*
8. **No valid emergency contact at arrival** — he arrives "with the name of a contact who
   may or may not still be at that address" (Book II §1.4); the experience must not block on
   an unreachable contact. *Open.*

## 7. Success criteria

Behaviour, not a dashboard. Membership works when:

1. **The relationship persists** — continuity holds, read from tenure and exit, not tickets
   (Book II §3.6; Article IV); tenure is the most predictive number (§4.11).
2. **The Member can draw his map** after three months (§2.2).
3. **He is addressed by name** on every surface (Truth 1.7).
4. **He can see his full assembled history, and every access to it** (Articles II, XV).
5. **Members leave clean** — "a Member who left clean tells five future Members" (§4.8).
6. **No second tier exists** (§6.7).

*Numeric targets (continuity rate, tenure goals) are economics and prioritisation, reserved
to Founder/Product — not set here.*

## 8. Assumptions (to confirm or correct)

- **[A1]** Membership is individual; family is part of the Member, not a separate Member
  (Book II §6.1).
- **[A2]** One active Membership per person at a time.
- **[A3]** Early-production creation is Operator-mediated, not self-serve (Article X).
- **[A4]** "My Family" is a *view* the Member sees (§2.2), not a separate family account.
- **[A5]** Member-facing names (Prospective / Member / Paused / Closed) correspond to Nia
  OS's pending / active / paused / closed.
- **[A6]** A membership number identifies the Member and is stable for one continuous
  Membership.

## 9. Founder decisions required

Where Nia OS is silent or a business ruling is needed, this document stops here.

- **FD-1 — Scope boundary.** Confirm Membership = lifecycle + identity + rights, with
  Onboarding, Trip Home, Off-boarding as separate specs — or widen it.
- **FD-2 — The Promise.** Author the actual wording (Book I §4.19).
- **FD-3 — When tenure begins.** Move-in, first Saturday (§4.12), or first wage?
- **FD-4 — Pause reasons.** May Membership pause beyond a trip home (§4.7)?
- **FD-5 — Tenure while paused, and maximum pause** before it becomes closure.
- **FD-6 — Return within 90 days.** Resume tenure or reset (§4.11 vs §4.8)?
- **FD-7 — Consent experience** and renewal cadence (Article XV).
- **FD-8 — Lapsed Prospective.** Handling of an incomplete-onboarding record (Book II §1.4).
- **FD-9 — Restoration processes** — the "process for each" breach (Article XVII).
- **FD-10 — Dignity-based removal** — due process and authority (Articles XVII, XVIII).
- **FD-11 — Women Members** — what is concretely higher (Book II §1.1).
- **FD-12 — Eligibility at creation** — enforced, and by Operator judgment or rule (Book II
  ch. 7)?
- **FD-13 — Death of a Member** — closure-and-settlement process (unspecified by the books).

## 10. References to Nia OS

Every behaviour above cites its section inline. Primary sources: **Book I** — Articles I,
II, V, VII, XII, XIII, XV, XVII, XVIII; §4.10–4.19 (definitions); Truth 1.7. **Book II** —
§1.1, §1.4, §1.5, §3.6, §4.3, §4.5, §4.7, §4.8, §5.3, §5.4, §6.1, §6.2; ch. 7. **Book IV** —
§1.1, §2.2, §3.6, §4.1, §4.7, §4.8, §4.9, §5.4, §6.5, §6.7. Where a trace did not exist, the
item was moved to *Founder Decisions Required* rather than resolved.

## 11. Questions Product Should Debate

Competing product directions — not Founder decisions, but design tensions worth Product's
discussion. No recommendation is offered unless Nia OS already answers.

- **Q1 — Operator-mediated creation, or evolving toward Member self-initiation?**
  *Trade-off:* Operator-mediated creation honours the human, dignified first 72 hours and
  "software follows operations"; self-initiation scales a corridor faster but risks the cold,
  illegible intake Nia exists to replace. *Why it matters:* it shapes how a corridor grows
  and whether the most expensive 72 hours stay human. *Options:* (a) permanently
  Operator-mediated; (b) Operator-mediated with Member-completed steps; (c) self-initiation
  once a corridor matures. *What Nia OS says:* it leans to Operator-mediated **early**
  (Article X; Book II §1.4; the Operator as "the human shape of the Studio," §3.6) but does
  not forbid the relationship evolving — so the long-run direction is open.

- **Q2 — How visible should the Member's lifecycle state be to him?**
  *Trade-off:* showing state (e.g., "Paused") is transparent and predictable (Article V);
  hiding it protects dignity and avoids making a Member feel labelled or "lesser" (Book II
  §5.3 pride, §5.4 shame). *Why it matters:* it sits exactly on the line between predictability
  and dignity, both of which Nia OS holds. *Options:* (a) states fully visible; (b) only
  Paused surfaced, framed as a kindness ("your Nest is held until you return"); (c) states
  never named to the Member, who experiences only continuity. *Nia OS does not resolve this.*

- **Q3 — Is "My Family" a Member-only view, or a surface the family can also reach?**
  *Trade-off:* the family is "part of the Member" (§6.1) and the remittance is "heard before
  it is spent" (§6.2), so family visibility could deepen trust and pre-empt the "phone call
  from a frightened wife" (§4.4); but a second audience adds consent complexity (Article XV)
  and risks importing control or surveillance dynamics into the relationship. *Why it
  matters:* it touches data ownership and the Member–family bond at once. *Options:* (a)
  Member-only view; (b) Member-controlled family view he switches on; (c) family receives
  only remittance confirmations, no app. *Nia OS constrains but does not decide* — any family
  access must satisfy Article XV consent.

- **Q4 — Is tenure shown to the Member as visible evidence, or kept internal?**
  *Trade-off:* tenure is "hope made visible" and could stand as quiet pride (Book II §5.5);
  but surfacing a growing counter risks drifting into gamification, and a Member whose tenure
  *resets* on return could feel shame (§5.4). *Why it matters:* it is the line between
  evidence and a streak. *Options:* (a) show tenure as a plain fact; (b) surface only
  milestones, quietly; (c) keep tenure internal. *What Nia OS says:* gamification is
  **forbidden** — "no badges, no streaks, no leaderboards, no points" (§6.3) — so any visible
  treatment must not become a game; within that hard limit, the choice is open.

- **Q5 — How proactive should Nia be in restoration?**
  *Trade-off:* reaching out when a Member is in breach honours "the process restores the
  relationship before it removes the Member" (Article XVII) and catches the dangerous
  silent-then-disappears signal (§3.6); but unsolicited contact risks a benefactor tone
  (§5.3) and must never breach Sunday silence (§5.4). *Why it matters:* it is the gap between
  care and intrusion. *Options:* (a) Operator-initiated human outreach; (b) Member-pull only,
  with help always one tap away; (c) automated nudges — *which would collide with the ban on
  engagement notifications (§6.2).* *Nia OS bounds the posture; the specific restoration steps
  remain FD-9.*
