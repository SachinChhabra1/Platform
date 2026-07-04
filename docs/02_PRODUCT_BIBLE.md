# Product Bible

The screen-by-screen product specification for the NiaBook Member app. This book answers, for
every screen: **why does it exist, why is each element there, what is the member trying to do,
and what happens when information is missing?**

Canon it builds on (do not duplicate — read them): [`../PRODUCT_ARCHITECTURE.md`](../PRODUCT_ARCHITECTURE.md)
(what Nia is) and [`../DESIGN_SYSTEM_LOCK.md`](../DESIGN_SYSTEM_LOCK.md) (the locked screens +
tokens). The five screens are frozen for the board; this book documents them, it does not
redesign them.

## Product truth (the frame every chapter assumes)

Nia helps a migrant worker do four things — **earn more · spend less · keep more · care for
home** — and **NiaBook is the home ledger that proves each promise became true.** Four pillars
serve the four promises; NiaBook records the result. Every service must make the next page of
NiaBook better.

- **RafiQi** is the finder of opportunity ("more you can keep"), surfaced across pillars.
  RafiQi finds; the member decides. Named, never the hero.
- **The flywheel:** earn more → keep more → send more home → family goals met → peace of mind
  → work better → earn more. Store and Work feed Family; everything feeds NiaBook.
- **Each screen must leave the member on a specific emotion**, not merely informed:
  **NiaBook → Truth · Work → Hope · Living → Relief · Store → Satisfaction · Family → Purpose.**
  A screen that only informs has failed, even if it matches the spec.

### Standards that bind every screen

- **Money first, explanation second. No judgement. No "wallet" language.** Sentence case.
  Reserved glyphs: `₹ → · ○ ✓`. Vocabulary is canonical: Member · **Nest** (never room) ·
  Membership fee (never rent) · Studio (never PG/hostel) · **NiaBook** (never wallet).
- **Colour carries state only, never decoration.** Restrained blue `#2C5880` is the accent for
  headings, money, links, selection; green is reserved for received/kept and used on NiaBook
  only. No red for SOS.
- **Missing / stale data: record reality, never invent.** An unknown figure is shown as a
  marked placeholder or omitted — never fabricated (methodology: no invented numbers). Empty
  states explain what is missing and the next step; they never celebrate emptiness.
- **SOS** is on every screen (quiet blue outline pill, `shield` + "SOS"): opens Nia Emergency,
  an abstract route (today the Operator), never permanently coupled to one destination.
- Chrome consistency: **NiaBook** owns the full header (title · language · identity · Studio ·
  month · SOS); the four **pillars** own a lighter header (title · SOS). This is the approved
  design, not an oversight.

---

## 00 · NiaBook — the home ledger (opens first)

**Purpose.** Prove the promises became true. NiaBook is the artefact of the product and the
default screen. It is not a wallet, statement, or tracker.

**Member problem.** "Did leaving home actually pay off this month? What is real, and what can I
still gain?"

**Emotion to leave: Truth** — "here is what became real."

**Information hierarchy (why, in order).**
1. **Header** — title, language toggle, identity ("Hi, Ramesh" + Monogram), Studio/place
   context, **month dropdown** (the ledger is monthly), SOS. Identity + month first so the
   member knows *whose* month this is.
2. **Summary line** — "₹300 more stayed with you than in May." Money first: the month already
   has a verdict, phrased against last month so progress is felt, not computed.
3. **Status line** — "4 unlocked · 9 waiting" (`✓` / `○`). The shape of the month in one glance.
4. **Left column — What became true** (proof, 45% width). Closed gains this month, each a
   check-badged row: reached family · yours · saved at Sukh · living cost. Then a progress card
   ("You are ₹300 ahead of May. Your best month yet.") and "This week at Sukh".
5. **Right column — More you can keep** (opportunity, 55%, "Found by RafiQi"). The hero gain
   (e.g. +₹2,500/mo Machine Operator, with its certification→wages+voucher→home chain and an
   "in progress" status), a ready voucher, a locked role. "See all opportunities (9)".

**The core motion.** Every month, one line moves from the **right** (waiting, `○`) to the
**left** (true, `✓`). That movement is the whole product; finishing a training or using a
voucher is what moves it. Columns are 45/55 (not 50/50) — optimise for scanning, not symmetry.

**Primary actions.** Tap an opportunity (see how to unlock it); change month; SOS. **Secondary.**
Language; "see all".

**States.**
- *Empty (new member):* left column has no closed gains yet — say "your first month is still
  being written," never a fake figure or a celebration of emptiness. Right column still shows
  RafiQi opportunities so there is always a next step.
- *Stale / unknown figure:* show a marked placeholder; never invent a number. NiaBook records
  reality.
- *Offline:* the board build is offline by design (Founder-accepted sample). A live build shows
  the last known month and marks it as such.

**Trust rules.** No judgement ("was leaving home worth it" is banned). Green appears here and
only here, for money received/kept.

**Acceptance.** Opens first; money-first summary; two columns with the right-to-left motion
legible in under five seconds; RafiQi named, not hero.

---

## 01 · Work — Earn more

**Purpose.** Answer exactly one promise: **earn more.** Nothing else belongs here.

**Member problem.** "How do I make more than ₹22,400 — and what's the nearest step?"

**Emotion to leave: Hope** — "I can earn more."

**Hierarchy (why, in order).**
1. **Promise** — "Earn more / A higher-paying role is one certification away."
2. **Hero (the opportunity, blue-bordered, found by RafiQi)** — **+₹2,500/month** more, Machine
   Operator II, "Certify to unlock — 20 minutes left." Hope leads; the biggest gain is first.
3. **Reality (grounding, second)** — current job (Machine Operator, TVS Hosur, ₹22,400/mo),
   next pay (₹8,200), attendance (21/22, "one more shift +₹850"). The base the opportunity
   lifts from — stated without judgement.
4. **Better jobs waiting** — the ladder, each row leading with the gain (+₹2,500 / +₹4,800 /
   +₹3,600 per month), tappable.
5. **Skill progress** — the certification bar (75%, "20 minutes left — then +₹2,500/month is
   yours"): the path to the hero.
6. **Close** — the economic chain into NiaBook: "Certify, and you keep ₹2,500 more every month
   / +₹2,000 wages · +₹500 Sukh voucher → more savings → your NiaBook."

**States.** No certification in progress → hero shows the nearest better job instead. No
attendance data → hide the "+₹850" nudge rather than show a false gain.

**Acceptance.** One promise only; the +₹2,500 opportunity is the hero; every row benefit-led;
the chain to NiaBook is explicit.

---

## 02 · Living — Spend less

**Purpose.** Lower, predictable living costs — and show the member their life here is easier.

**Member problem.** "What does living here cost me, and what am I getting for it?"

**Emotion to leave: Relief** — "my life here is easier."

**Hierarchy (why).**
1. **Promise** — "Spend less / Lower, predictable living costs."
2. **Studio** — "Umapathi Studio · Nest 204 · 31 days left in this stay." Place + tenure,
   in canonical vocabulary (Nest, never room).
3. **This month's cost** — ₹2,400, "Everything included," with utilities as blue-status tiles
   (Electricity/Water included; Wi-Fi ≈₹250; Laundry ≈₹300) so "included" reads as money saved.
4. **Services (benefit-led, tappable)** — each framed as what it does for the member, not a
   facility: Nest ("Rest well. Work better tomorrow."), Meals ("No cooking. More time and
   energy."), Community ("Meet workers. Hear of better jobs."), Safety ("Family worries less."),
   Services ("Clean Nest after every shift."), Service requests ("Resolved fast. Back to work.").
5. **Opportunity (RafiQi, cross-pillar)** — "Laundry's included — skip the wash / Log a Sunday
   overtime shift instead / +₹800 · Work."
6. **Close** — "This month you kept ₹550 by living here / Plus ~14 hours back — time to earn ·
   Feeds your NiaBook." Relief is money *and* time returned.

**States.** Service-request count 0 → show "0", not an empty row. Unknown utility cost → mark
"included" only when truly included; otherwise show the estimate.

**Acceptance.** Every service row is benefit-led, not a facilities menu; Nest/Studio/Membership
vocabulary correct; the outcome returns cost *and* hours.

---

## 03 · Store — Keep more (the flywheel screen)

**Purpose.** Money kept — **not commerce.** The screen *is* the flywheel, understood without a
diagram: voucher → basket → savings → NiaBook.

**Member problem.** "Am I actually keeping more by buying here?"

**Emotion to leave: Satisfaction** — "I kept more."

**Hierarchy (why).**
1. **Promise** — "Keep more / Every basket keeps more of your money."
2. **Hero — money, the flywheel's fuel** — "₹500 waiting · Sukh voucher · found by RafiQi ·
   spend at Sukh Store — use by 30 July." The hero is always money, **never a product**.
3. **Today's basket** — every SKU answers one question: *how much did I keep?* The **kept
   amount is the strongest element** (blue, large); market (struck through) and Sukh prices
   shrink to a quiet subline. Footer: "You kept ₹63 on today's basket."
4. **Keep even more (RafiQi smart swaps)** — +₹10 / +₹5 / +₹15 per month, tappable.
5. **Savings, compounding** — the thing only Store has: **Today ₹63 → This month ₹185 → This
   year ₹2,460**, the year visually largest. Compounding is the motivation.
6. **Close (literal)** — "This month, ₹185 moved into your NiaBook / Today ₹63 · this year
   ₹2,460 — savings that compound."

**Product guard.** Every time a product appears, ask: *does this help the member understand how
much money they kept?* If not, remove it. Store must never become an e-commerce app.

**States / data coherence.** `today ≤ month ≤ year`, and the basket's kept amounts **sum to the
"today" figure** (₹63). A mismatch is a bug (this was fixed once — see `CHANGELOG.md`). Unknown
market price → omit the SKU rather than show a fake saving.

**Acceptance.** Hero is money; each SKU's saving reads stronger than its price; compounding
ladder present; close is literal money into NiaBook.

---

## 04 · Family — Take better care of home (the emotional centre)

**Purpose.** The emotional centre of the OS. **Not** remittance, payments, or insurance. Every
block answers one question: *how are the people I left home for?*

**Member problem.** "Are the people I left home for okay — and am I taking care of them?"

**Emotion to leave: Purpose** — "the people I left home for are doing better."

**Hierarchy (why — order is the message).**
1. **Promise** — "Take better care of home / How are the people you left home for?" (The nav
   still reads *Family*; the promise is care. "Send more home" was retired — see `CHANGELOG.md`.)
2. **People first (the hero)** — Mother (Amma) ✓ Healthy · Father (Appa) ✓ Healthy · Ravi (Son ·
   Class 6) ✓ Fees paid. Warm monograms, tappable. The first thing seen is **who**, not how much.
3. **Money, second** — "₹5,000 reached home this month ✓ On time." Money is one way of caring,
   not the point — so it follows people.
4. **Goal (the cross-pillar flywheel, felt not explained)** — "Ravi's school fees ₹1,200 · Due
   15 July," covered by ✓ Two overtime shifts `Work` · ✓ A Machine Operator promotion `Work` · ✓
   Four months of Sukh savings `Store`. Family points at the other pillars without naming the
   architecture.
5. **Protection (reassures, never sells)** — "Your family is protected": Insurance Active ·
   Medical Covered · Emergency fund Ready.
6. **Close (emotional, not financial)** — a heart, not a trend line: "The people you left home
   for are doing better / Your NiaBook remembers every month you showed up." The only pillar
   whose flywheel closes on emotion; NiaBook is the quiet proof beneath.

**States.** A family member's status unknown → show the person without a false "✓ Healthy";
never invent wellbeing. No upcoming goal → show the people + money + protection; do not
manufacture a goal.

**Acceptance.** People before money; the goal points cross-pillar; protection reassures; the
close lands on purpose, not finance.

---

## Calculation ledger

Every member-facing number must trace to a documented rule.

| Calculation | Rule | Notes / tests |
|---|---|---|
| `formatPaise(paise)` | integer paise → rupees, **Indian grouping** (last 3 digits, then groups of 2: ₹1,00,000 / ₹1,23,45,678); sign before `₹`; round to nearest rupee, **half away from zero** | `apps/member/lib/features/niabook/niabook_scenario.dart`; tested in `test/niabook_scenario_test.dart` |
| Store — "you kept" per SKU | `market − Sukh` | kept reads stronger than price |
| Store — basket total | `Σ(kept)` = the **Today** figure (₹63) | must cohere; `today ≤ month ≤ year` |
| Work — the chain | certification → **+₹2,000 wages + ₹500 Sukh voucher = +₹2,500/mo** | shown on Work + NiaBook hero |
| NiaBook — monthly delta | this month vs last, money that "stayed with you" | never a judgement, only a figure |

## How to extend this book

When a screen or flow changes, update its chapter **in the same session** as the code. A
chapter is mature when the screen could be rebuilt from it alone: purpose, member problem, the
emotion it must leave, why each element is there and in that order, every data state (empty,
loading, stale, offline, missing), and its acceptance criteria. New flows (onboarding, payments,
recovery) get their own chapter when they are built — grounded, never invented ahead of the code.
