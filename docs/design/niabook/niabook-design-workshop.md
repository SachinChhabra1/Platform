# NiaBook — Founder Product Design Workshop

Design-only. No code, no Flutter, no APIs. Product level throughout.
Reference scenario uses the Founder-accepted June numbers: salary ₹14,000 · reached
home ₹5,000 · room ₹2,400 · food ₹1,800 · saved ₹2,000 · in hand now ₹3,480 ·
stayed with you ₹4,800 · Sukh Store saving ₹185 · unused voucher ₹500.

---

## 1 · Product philosophy

**NiaBook is the monthly proof that leaving home was worthwhile.**

A bank statement records transactions. A passbook records balances. A wallet records
money. **NiaBook records progress** — it is the one place where every part of Nia
(work, living, food, family, savings, shopping, health, insurance, and whatever comes
next) leaves visible evidence that this month, being away paid off.

The product has exactly one job: when a Member opens it at month's end, within five
seconds and with no financial literacy, they understand **what this month gave them** —
and whether it gave more than the last.

If a section does not help answer *"was leaving home worthwhile this month?"*, it does
not belong on the page.

---

## 2 · Mental model — the book of months

The name is the model. A **book** has **pages**; each **month is one page**. The
default view is this month's page. You can flip back through earlier pages, and the
pages get better over time — that *is* the progress the product records.

This resolves the tension the North Star sets up. The 5-second read needs a single
month's verdict; "records progress" needs history. A book gives both: one page to read
now, a spine of pages behind it that thickens with every month worked away from home.

Three consequences fall out of the model and shape everything below:

- **A page has a verdict, not a balance.** The top of the page answers the question,
  in words, before any number is read.
- **A page tells a story top-to-bottom**, the way a page is read — earned, went home,
  kept, what Nia added — not a grid of accounts.
- **Pages accumulate.** The Member is building something by staying. The empty months
  before Nia, and the fuller months after, are the argument.

What NiaBook is **not**, held firm against every temptation: not a wallet, not a
statement, not a passbook, not an expense tracker, not a dashboard.

---

## 3 · Information hierarchy

Ranked by what survives Phase-4's test — *"if this vanished, would the Member lose part
of the story of why they left home?"*

**Tier 1 — the verdict (must read in 5 seconds).** A plain sentence — "June was worth
it" — and the one figure that proves it: **what became yours and your family's**
(reached home + kept). This is the answer. Everything else is evidence for it.

**Tier 2 — where the salary went (the story).** Salary arrived → reached home → the
cost of being here (room, food) → what stayed with you → what's in your hand now. Four
or five lines, in that order, as sentences.

**Tier 3 — what Nia added (the flywheel).** Money Nia saved you at Sukh Store; the
voucher waiting. This is value *above* the salary — the reason to use more of Nia. It
is first-class, but it sits below the earned-money story because the earned money is
why he left; Nia's value is why he stays with Nia.

**Tier 4 — better than last month.** One line of comparison. Quiet, but it is the
"progress" the whole product is named for.

**What disappears:** balances, running totals, transaction IDs, dates and timestamps,
category grids, charts as decoration, any "available balance / statement / account"
framing. None of it helps answer the question; all of it makes the page read like a
bank.

---

## 4 · User journey — the emotional arc

The page should move the Member through a felt sequence, not present a report:

1. **Relief / pride** — "It was worth it." (verdict)
2. **Recognition** — "My salary came, in full and on time." (the money is real)
3. **Purpose** — "This much reached home." (why I left)
4. **Security** — "This much stayed with me." (I'm building something)
5. **Gift** — "And Nia added a bit more." (I'm better off inside Nia)
6. **Momentum** — "Better than last month." (staying is working)

The arc must hold even in a hard month. A lean month reads with dignity, never shame —
the verdict softens ("June was steady") but the structure is identical. There is no
red, no warning, no severity anywhere in the product.

---

## 5 · Low-fidelity concepts (explore before converging)

Three mental models, deliberately different. ASCII, monochrome, hierarchy only — no
colour or type decisions yet.

### Concept A — "The Verdict" (single-month story, top-down)

```
┌───────────────────────────────┐
│  June 2026                     │
│                                │
│  June was worth it.            │   ← verdict sentence
│                                │
│  ₹9,800                        │   ← HERO number
│  became yours and your family's│
│  ₹5,000 home · ₹4,800 kept     │   ← the split, small
│  ──────────────────────────    │
│  Your ₹14,000 salary arrived,  │
│  in full and on time.          │
│                                │
│  ₹5,000  reached home          │
│  ₹4,800  stayed with you       │
│  ₹4,200  the cost of being here│
│  ₹3,480  in your hand now      │
│  ──────────────────────────    │
│  What Nia added                │
│  ₹185  saved at Sukh Store     │
│  ₹500  voucher waiting  (grey) │
│  ──────────────────────────    │
│  ₹300 more kept than in May →  │
└───────────────────────────────┘
```

Strength: reads exactly as the emotional arc. Weakness: the "cost of being here" line
risks feeling negative if not phrased as a toll, not a loss.

### Concept B — "Three Pockets" (money by destination)

```
┌───────────────────────────────┐
│  June — your ₹14,000           │
│                                │
│   HOME        KEPT      HERE   │
│   ₹5,000     ₹4,800   ₹4,200   │
│   reached    stayed    room +  │
│   family     with you  food    │
│  ──────────────────────────    │
│  In your hand now   ₹3,480     │
│  ──────────────────────────    │
│  Nia added  ₹185 saved         │
│             ₹500 waiting (grey)│
└───────────────────────────────┘
```

Strength: matches how a migrant worker actually splits a salary in his head — some
home, some saved, some spent to live here. Weakness: three equal columns read as a
dashboard; loses the verdict and the story arc.

### Concept C — "The Growing Book" (progress-first)

```
┌───────────────────────────────┐
│  Your NiaBook                  │
│                                │
│  Apr  ▁  ₹8,900                │
│  May  ▃  ₹9,500                │
│  Jun  ▅  ₹9,800   ← this month │   ← spine of pages
│  ──────────────────────────    │
│  June was worth it.            │
│  ₹9,800 yours and your family's│
│  [ open June's page ]          │
└───────────────────────────────┘
```

Strength: makes "records progress" literal and undeniable — you can *see* the months
rising. Weakness: leads with a chart-like element; a first-time user with two months of
history has nothing to show, and it buries the current-month story one tap down.

**Why not converge here:** A is the strongest single-month read, B is the truest to the
worker's own accounting, C is the truest to the North Star. The right product borrows
from all three.

---

## 6 · High-fidelity concept (the recommendation)

**Concept A as the spine, with C's progress folded in as a footer band, and B's
"pocket" clarity used inside the story lines.** One page, one screen, one story, with
the growing book acknowledged at the bottom and reachable by a flip-back.

Structure of the page, top to bottom:

1. **Page header** — "June 2026" small; the month is the page.
2. **The verdict** — "June was worth it." One line, largest text weight on the page
   after the hero number.
3. **The hero** — **₹9,800**, "became yours and your family's", with the split
   "₹5,000 reached home · ₹4,800 you kept" beneath in muted text. This is the single
   thing a five-second glance lands on.
4. **The story** — salary sentence, then the destination lines as sentences, in arc
   order. "Reached home" and "stayed with you" carry the one restrained state colour
   (received/kept = good). "Cost of being here" is neutral ink and phrased as a toll,
   not a loss. "In your hand now" closes the story.
5. **What Nia added** — a quietly set-apart band. "You saved ₹185 at Sukh Store" in the
   received colour (proof, not a purchase). "₹500 Sukh Store voucher waiting" in muted
   grey (desire, not yet acted on).
6. **Progress footer** — "You kept ₹300 more than in May" with a small up-marker, and a
   quiet "flip back" affordance to earlier pages.

Why this wins over the alternatives: B alone loses the verdict and reads as a dashboard;
C alone buries today's story and is empty for new Members. A carries the arc but, alone,
under-serves the "progress" mandate — the footer band fixes that in one line without
stealing the top of the page. The result reads as a story, proves value without
marketing, and the flywheel is visible on the page rather than explained.

The hi-fi visual is rendered in chat alongside this document (default month plus the
five required states).

---

## 7 · Complete UI copy

Every word on the page, written for a first-generation smartphone user. Sentence case,
plain language, no banking terms. Numerals shown in Latin here; production renders the
Member's script.

**Header**
- `June 2026`

**Verdict** (state-dependent, one line — never shame)
- Good month: `June was worth it.`
- Steady month: `June was steady.`
- Hard month: `June was a hard month. You still sent money home.`

**Hero**
- `₹9,800`
- `became yours and your family's`
- `₹5,000 reached home · ₹4,800 you kept`

**The story**
- `Your ₹14,000 salary arrived, in full and on time.`
- `₹5,000 reached your family back home.`
- `₹4,800 stayed with you — ₹2,000 saved, the rest yours.`
- `₹4,200 was the cost of being here — your room and your food.`
- `₹3,480 is in your hand right now.`

**What Nia added**
- Section label: `What Nia added`
- Saving present: `You saved ₹185 at Sukh Store this month.`
- Voucher unused: `₹500 Sukh Store voucher waiting for you.`
- Voucher redeemed: `You used your ₹500 voucher at Sukh Store.`
- No shopping yet: `Shop at Sukh Store to keep more of your money.`

**Progress footer**
- More kept: `You kept ₹300 more than in May.`
- Less kept: `You kept ₹200 less than in May. Still a full month sent home.`
- First month: `This is your first page. Your NiaBook grows every month.`
- Flip back: `See earlier months`

**No work through Nia this month** (voucher slot, muted)
- `Work through Nia to unlock your ₹500 Sukh Store voucher.`

---

## 8 · Design rationale

- **Verdict before evidence.** The page answers the question in words at the top so the
  number underneath is understood, not decoded. This is the single biggest departure
  from every fintech surface, which leads with a balance.
- **Two outcomes, not one balance.** Migration has two payoffs — money home and money
  kept. The hero sums exactly those two and names them. The "cost of being here" is
  shown but framed as a toll, so the worker sees that 70% of the salary became durable
  value.
- **Nia's value sits above the salary math, below the earned money.** Earned money is
  why he left; Nia's added value is why he stays with Nia. Ordering the page this way
  keeps the product honest — it never pretends Nia earned his salary — while still
  making the flywheel first-class.
- **Sukh Store as money kept, not commerce.** "You saved ₹185" is evidence, phrased as
  a gain, never "you bought groceries." The Member should think *Nia helped me save.*
- **The voucher is desire, held in grey.** Visible but muted when unused; it quietly
  says work unlocks more. Hiding it would kill the flywheel; shouting it would read as
  marketing.
- **Colour is state, never decoration.** One restrained received/kept tone marks money
  that reached home or stayed with him; grey marks unused/waiting; everything else is
  ink. No category colours, no charts-as-ornament, no RAG.
- **Numbers are the hero; icons only navigate.** Nothing on the page is there to
  decorate. Every number earns its place by advancing the story.
- **Dignity in a hard month.** No red, no severity, no shame field anywhere. The verdict
  softens; the structure never changes. A lean month must feel as safe to open as a
  good one.

---

## 9 · Questions and trade-offs

1. **Green vs pure monochrome.** The design system v2.1 says no green; the NiaBook
   direction says restrained green = received. I've used a single quiet received tone
   as a state signal only. *Trade-off:* colour-as-state aids the 5-second read for
   low-literacy users; the cost is one deviation from the house palette. **My call:**
   keep the restrained received tone. Switch to mono-blue only if brand consistency
   outranks legibility here.
2. **Hero = the ₹9,800 sum, or "reached home ₹5,000" alone?** The sum is the fuller
   truth (home + kept); "reached home" is the purest emotional hit. **My call:** the
   sum, because "kept" is half of why staying with Nia matters and a savings product
   needs it visible. Fallback: lead with reached-home if user testing shows the sum
   reads as abstract.
3. **Show the "cost of being here"?** It risks feeling negative. **My call:** show it,
   framed as a toll, because hiding it makes the hero look too good and erodes trust —
   the Member knows he paid for his room. Honesty is the moat.
4. **How much history before the progress footer earns its place?** With one month it's
   empty. **My call:** show an inviting first-month line instead, and let the footer
   become a comparison from month two.
5. **The name in the wild.** The product only works if people say "open your NiaBook."
   That requires the page to feel like a personal record, not an app screen — argues for
   the book/page framing over any dashboard.

---

## 10 · Final recommendation

Ship **Concept A as the spine** — verdict, hero, story, Nia-added, progress footer — on
the **book-of-months** mental model. It is the only one of the three that answers the
core question in five seconds, proves Nia's value without a word of marketing, and keeps
the flywheel visible on the page. B and C each hold one truth the spine absorbs: B's
pocket clarity lives inside the story lines, C's progress lives in the footer.

Hold the line on the three things that make this a new category rather than a nicer
wallet: **verdict before number, story before transactions, dignity in every month.**
Next step on approval: pressure-test the copy and the five states with real Members
before any build.
