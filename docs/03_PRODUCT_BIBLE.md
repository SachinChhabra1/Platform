# 03 · Product Bible

The screen-by-screen product specification for the NiaBook Member app. For every screen it
answers: **why does it exist, why is each element there, what is the member trying to do, and
what happens when information is missing?**

**How this was made.** Mined from the implementation, not from memory or a template:
`apps/member/lib/features/{niabook,pillars,shell}`, the shared kit (`pillar_kit.dart`,
`nia_components.dart`), the shell (`member_shell.dart`), the sample data
(`niabook_scenario.dart`), the ADRs (`adr/`), and recorded product intent (`design/niabook/`,
`product/`). Canon it builds on (do not duplicate — read them): [`../PRODUCT_ARCHITECTURE.md`](../PRODUCT_ARCHITECTURE.md)
and [`../DESIGN_SYSTEM_LOCK.md`](../DESIGN_SYSTEM_LOCK.md). **Never restate an ADR — reference it.**
Uncertain areas are marked `> FOUNDER REVIEW`.

## Implementation map (real, mined)

| Screen | Widget | File |
|---|---|---|
| NiaBook | `NiaBookPage` | `features/niabook/niabook_page.dart` (data: `niabook_scenario.dart`) |
| Work | `WorkPage` | `features/pillars/work_page.dart` |
| Living | `LivingPage` | `features/pillars/living_page.dart` |
| Store | `StorePage` | `features/pillars/store_page.dart` |
| Family | `FamilyPage` | `features/pillars/family_page.dart` |
| Shell | `MemberShell` | `features/shell/member_shell.dart` + `widgets/nia_bottom_nav.dart` |
| Shared | `PillarScaffold`, InfoCard/ListRow/SummaryCard/SectionHeader/OpportunityCard/NiaReveal | `features/pillars/pillar_kit.dart`, `nia_components.dart` |

- **Clients are Flutter** (ADR-0002). **Design system is tokens + split components** (ADR-0003);
  tokens in `theme/nia_tokens.dart`.
- **State today:** the five screens are `StatelessWidget`s rendering **sample data**
  (`NiaBookMonth.sample`, `PrototypeData`). **There is no Riverpod / provider layer yet.** In a
  live build the data-bearing screens read `/v1` through the generated client when
  `NIA_API_BASE_URL` is set (ADR-0007, ADR-0008), but the money-movement backend is **paused**.
  `> FOUNDER REVIEW: state-management choice (Riverpod vs. other) is unmade; record as an ADR when the first live screen is wired.`
- **Navigation:** `MemberShell` is an `IndexedStack` of the five screens (tab state preserved);
  there is **no router**. The only sub-navigation is a **modal bottom sheet** for the Operator
  (SOS → `openNiaEmergency` → `openOperatorSheet` in `widgets/common.dart`). In the prototype,
  card/row taps are **honest no-ops** (`prototypeNoOp` shows "no behaviour in the prototype").
- **i18n:** the header language control is real UI; localisation architecture is ADR-0010. Money
  uses Latin digits in the prototype, the member's script in production (`formatPaise`).
- **RafiQi** is the finder of opportunity and a standalone orchestration service (ADR-0004);
  in the app it appears as the "found by RafiQi" line, never as the hero.

## Product truth (the frame every chapter assumes)

Nia helps a migrant worker **earn more · spend less · keep more · care for home**, and **NiaBook
is the home ledger that proves each promise became true.** Four pillars serve the four promises;
NiaBook records the result. Every service must make the next page of NiaBook better. Each screen
must leave the member on a specific **emotion**, not merely informed:
**NiaBook → Truth · Work → Hope · Living → Relief · Store → Satisfaction · Family → Purpose.**

### Standards that bind every screen

- **Money first; no judgement; no "wallet" language.** Sentence case. Reserved glyphs `₹ → · ○ ✓`.
  Vocabulary: Member · **Nest** (never room) · Membership fee (never rent) · Studio (never
  PG/hostel) · **NiaBook** (never wallet).
- **Colour carries state only.** Restrained blue `#2C5880` = accent (headings, money, links,
  selection); green = received/kept, **NiaBook only**; SOS is never red.
- **Missing / stale data: record reality, never invent.** Unknown figures are marked placeholders
  or omitted, never fabricated. Empty states explain the next step; they never celebrate emptiness.
- **Every async surface has a complete state machine** (R9): loading → success → (empty if
  applicable) → error → retry, and offline where a network is involved. On a failed live fetch the
  Member sees a calm "We couldn't reach Nia" and a **Try again** — never an endless spinner; at
  sign-in an unreachable server ("check your connection", retry) is distinct from a refused number
  (the Operator). Inventory + rule: [`R9_ASYNC_STATE_AUDIT.md`](../R9_ASYNC_STATE_AUDIT.md).
- **SOS on every screen** (blue outline pill) → Nia Emergency, an abstract route (today the
  Operator), never permanently one destination.
- **Chrome:** NiaBook owns the full header (title · language · identity · Studio · month · SOS);
  the four pillars own a lighter header (title · SOS). Approved design, not an oversight.

---

## 00 · NiaBook — the home ledger (opens first)

*Implementation: `NiaBookPage` · data `NiaBookMonth.sample`, `formatPaise`, `BecameTrueRow`,
`Opportunity`/`OppStatus`, `SukhOffer`.*

**Purpose.** Prove the promises became true. NiaBook is the artefact of the product and the
default tab — not a wallet, statement, or tracker. **Member problem:** "Did leaving home pay off
this month, and what can I still gain?" **Emotion: Truth.**

**Information hierarchy (why, in order).**
1. **Header** — title, language toggle, identity ("Hi, Ramesh" + `Monogram`), Studio/place
   context, **month dropdown** (the ledger is monthly), SOS. Whose month, and which month, first.
2. **Summary line** — "₹300 more stayed with you than in May." Money first: the month has a
   verdict, phrased against last month so progress is felt.
3. **Status line** — "4 unlocked · 9 waiting" (`✓`/`○`): the shape of the month at a glance.
4. **Left — What became true** (proof, 45%): closed gains, each check-badged (reached family ·
   yours · saved at Sukh · living cost); a progress card ("You are ₹300 ahead of May. Your best
   month yet."); "This week at Sukh".
5. **Right — More you can keep** (opportunity, 55%, "Found by RafiQi"): the hero gain (+₹2,500/mo
   Machine Operator with its certification→wages+voucher→home chain and an "in progress" status),
   a ready voucher, a locked role, "See all opportunities (9)".

**The core motion.** Each month one line moves **right → left** (`○` waiting → `✓` true).
Finishing a training or using a voucher is what moves it. Columns are 45/55 — scanning over
symmetry.

**States.** *Empty (new member):* no closed gains yet — say the first month is still being
written; never a fake figure; keep RafiQi opportunities so there is always a next step. *Stale/
unknown:* marked placeholder, never invented. *Offline:* board build is offline by design
(Founder-accepted sample). **Acceptance:** opens first; money-first; the right→left motion legible
in <5s; RafiQi named, not hero.

> FOUNDER REVIEW: NiaBook surfaces **no tenure** (per DECISIONS FD-3/Q4). Confirm this stays true
> if a future screen is tempted to show "months with Nia."

---

## 01 · Work — Earn more

*Implementation: `WorkPage` on `PillarScaffold` (roles: opportunity → reality → supporting).*

**Purpose:** exactly one promise — **earn more.** **Member problem:** "How do I make more than
₹22,400, and what's the nearest step?" **Emotion: Hope.**

**Hierarchy (why).** Promise ("A higher-paying role is one certification away") → **hero** (the
opportunity, blue-bordered, RafiQi: **+₹2,500/month**, Machine Operator II, "Certify to unlock —
20 minutes left"; hope leads) → **reality** (Machine Operator, TVS Hosur, ₹22,400/mo; next pay
₹8,200; attendance 21/22, "one more shift +₹850" — grounding, no judgement) → **better jobs
waiting** (the ladder, each row leading with its gain, tappable) → **skill progress** (75%, "20
minutes left — then +₹2,500/month is yours") → **close** (the chain into NiaBook: "+₹2,000 wages ·
+₹500 Sukh voucher → more savings → your NiaBook").

**States.** No certification in progress → hero shows the nearest better job. No attendance data →
hide the "+₹850" nudge rather than show a false gain. **Acceptance:** one promise; +₹2,500 is the
hero; every row benefit-led; chain to NiaBook explicit.

---

## 02 · Living — Spend less

*Implementation: `LivingPage` (roles: reality → supporting → opportunity).*

**Purpose:** lower, predictable living costs — and show the member life here is easier. **Member
problem:** "What does living here cost, and what do I get?" **Emotion: Relief.**

**Hierarchy (why).** Promise ("Lower, predictable living costs") → **Studio** ("Umapathi Studio ·
Nest 204 · 31 days left" — place + tenure, **Nest** never room) → **this month's cost** (₹2,400,
"Everything included," utilities as blue-status tiles so "included" reads as money saved) →
**services** (benefit-led, tappable — Nest "Rest well. Work better tomorrow.", Meals "No cooking.
More time and energy.", Community "Meet workers. Hear of better jobs.", Safety, Services, Service
requests) → **opportunity** (RafiQi cross-pillar: "Laundry's included — skip the wash / Log a
Sunday overtime shift instead / +₹800 · Work") → **close** ("This month you kept ₹550 by living
here / Plus ~14 hours back — time to earn · Feeds your NiaBook").

**States.** Service-request count 0 → show "0". Mark a utility "included" only when truly included;
else show the estimate. **Acceptance:** every service row is benefit-led, not a facilities menu;
Nest/Studio/Membership vocabulary correct; outcome returns cost *and* hours.

---

## 03 · Store — Keep more (the flywheel screen)

*Implementation: `StorePage` (roles: opportunity → supporting → reality).*

**Purpose:** money kept — **not commerce.** The screen *is* the flywheel (voucher → basket →
savings → NiaBook). **Member problem:** "Am I actually keeping more?" **Emotion: Satisfaction.**

**Hierarchy (why).** Promise ("Every basket keeps more of your money") → **hero = money, the
fuel** ("₹500 waiting · Sukh voucher · found by RafiQi · use by 30 July"; the hero is always
money, never a product) → **today's basket** (every SKU answers *how much did I keep?* — the kept
amount is the strongest element; market struck through + Sukh price shrink to a subline; footer
"You kept ₹63 on today's basket") → **keep even more** (RafiQi smart swaps, tappable) → **savings,
compounding** (**Today ₹63 → month ₹185 → year ₹2,460**, year largest — the thing only Store has)
→ **close (literal)** ("This month, ₹185 moved into your NiaBook").

**Product guard.** Every product must help the member see money kept, or it is removed. Store must
never become an e-commerce app. **Data coherence:** `today ≤ month ≤ year`, and the basket's kept
amounts **sum to the "today" figure** (₹63) — a mismatch is a bug (fixed once; see CHANGELOG).
**Acceptance:** hero is money; each SKU's saving reads stronger than its price; compounding present;
close is literal money into NiaBook.

---

## 04 · Family — Take better care of home (the emotional centre)

*Implementation: `FamilyPage` (roles: reality[people, money] → opportunity[goal] →
supporting[protection]); close uses `SummaryCard(icon: favorite)`.*

**Purpose:** the emotional centre — **not** remittance, payments, or insurance. Every block
answers: *how are the people I left home for?* **Emotion: Purpose.**

**Hierarchy (order is the message).** Promise ("Take better care of home / How are the people you
left home for?" — nav still reads *Family*; "Send more home" was retired, see CHANGELOG) →
**people first (hero)** (Mother/Amma ✓ Healthy · Father/Appa ✓ Healthy · Ravi/Son·Class 6 ✓ Fees
paid; warm monograms, tappable — the first thing seen is **who**) → **money, second** ("₹5,000
reached home this month ✓ On time" — money is one way of caring, not the point) → **goal
(cross-pillar flywheel, felt not explained)** ("Ravi's school fees ₹1,200," covered by ✓ Two
overtime shifts `Work` · ✓ A Machine Operator promotion `Work` · ✓ Four months of Sukh savings
`Store`) → **protection (reassures, never sells)** ("Your family is protected": Insurance · Medical
· Emergency fund) → **close (emotional)** (a heart: "The people you left home for are doing better
/ Your NiaBook remembers every month you showed up").

**States.** A member's status unknown → show the person without a false "✓ Healthy"; never invent
wellbeing. No upcoming goal → show people + money + protection; do not manufacture a goal.
**Acceptance:** people before money; the goal points cross-pillar; protection reassures; the close
lands on purpose.

---

## Surfaces not in the frozen OS

`apps/member/lib/features/` also contains prototype/legacy surfaces **not mounted in the shell**:
`auth`, `recovery` (session recovery — spec `product/0002`), `membership`/`promise`
(membership + the Promise — spec `product/0001`, FD-2), and older `home`, `wallet`, `profile`,
`clusters`, `family/my_family_page`, `placeholder`. The shell (`member_shell.dart`) mounts only
NiaBook + the four pillars.

> FOUNDER REVIEW: decide the fate of each legacy surface — fold into the OS, keep as a separate
> flow (auth/recovery clearly stay), or retire. `features/wallet/*` is unwired and uses retired
> "wallet" language; `KNOWN_BUGS.md` lists it as not-scheduled-for-removal (tests depend on it).

## Calculation ledger

| Calculation | Rule | Source / test |
|---|---|---|
| `formatPaise(paise)` | paise → rupees, **Indian grouping** (₹1,00,000 / ₹1,23,45,678); sign before `₹`; round half **away from zero** | `niabook_scenario.dart`; `test/niabook_scenario_test.dart` |
| Store — "you kept" / SKU | `market − Sukh` | kept reads stronger than price |
| Store — basket total | `Σ(kept)` = the **Today** figure; `today ≤ month ≤ year` | must cohere |
| Work — the chain | certification → **+₹2,000 wages + ₹500 Sukh voucher = +₹2,500/mo** | Work + NiaBook hero |

## Open questions (Founder review)

- Sample figures (Ramesh, the ₹300 delta, dates) are **Founder-accepted demo data**; real values
  await the backend un-pause and the first wired provider.
- The Promise headline is anchored but its exact sentence is **pending Founder ratification**
  (DECISIONS FD-2).
- State-management choice, legacy-surface fates, and whether any tenure is ever surfaced (Q4) are
  open — marked inline above.

## How to extend this book

Update a chapter **in the same session** as the code that changes it. A chapter is mature when the
screen could be rebuilt from it alone: purpose, member problem, the emotion, why each element is
there and in that order, every data state, and acceptance. New flows (onboarding, payments,
recovery) get their own chapter **when built** — mined, never invented ahead of the code.
