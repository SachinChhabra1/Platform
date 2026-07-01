# NiaBook — Workshop B · The Three Pockets

Design-only. Second direction, to be critiqued beside Workshop A (the Verdict spine).
Discipline: make it true first, beautiful later. Same June scenario — salary ₹14,000 ·
home ₹5,000 · room ₹2,400 · food ₹1,800 · saved ₹2,000 · spare ₹2,800 · in hand now
₹3,480 (incl. ₹680 carried from May) · Sukh Store saving ₹185 · unused voucher ₹500.

---

## 1 · Product philosophy

Same North Star as A: **NiaBook proves whether leaving home was worthwhile this month.**
Where A answers with a *verdict and a hero number*, B answers with *where the money
went* — because to a migrant worker, worth is not an abstract figure, it is the honest
division of a salary between the people and needs it was earned for.

The philosophy of B: **the salary is the whole story, and the story is told by where
every rupee landed.** Nothing is summarised away. The Member does not read a conclusion;
he reads the division and draws the conclusion himself — which is the more durable kind
of trust.

---

## 2 · Mental model — three pockets

Every rupee a migrant worker earns goes to one of three places, and he already thinks
this way before he ever opens an app:

- **Home** — money that reached his family. The reason he left.
- **Here** — the cost of being away: his room and his food. The toll.
- **Yours** — what he kept: saved, and in his hand. What he is building.

Three pockets, and every rupee falls into exactly one. That completeness is the truth
test — the three must always add up to the salary, with no leftover and no overlap. When
they do, the page cannot lie: the Member can see his whole month in one division.

**The Nia insight this model exposes:** Nia's job is to **move rupees from Here to
Yours** — shrink the toll, grow what he keeps. Sukh Store savings are exactly that:
money that would have left the Here pocket at market price and instead stayed in Yours.
The voucher is a future rupee Nia is promising to move. In A the flywheel is a band you
read; in B it is a motion you can see.

The carry-forward (₹680 from May) is handled honestly: it is not this month's salary, so
it is **not** a fourth pocket. It lives inside Yours as a sub-line of "in your hand now,"
labelled as carried from last month. Truth over tidiness.

---

## 3 · Information hierarchy

**Tier 1 — the division.** One proportional split of the salary into Home / Here /
Yours, read in a glance. Home and Yours carry the received tone (good); Here is muted
grey (the toll). The proportion *is* the verdict: when the green outweighs the grey, the
month was worth it — no separate hero number needed. A short human line sits above it so
a five-second read still gets a word, not only a shape.

**Tier 2 — inside each pocket.** Under the split, three short blocks: Home (reached your
family); Here (room, food); Yours (saved, in hand now — with the carry noted). Sentences,
not a grid.

**Tier 3 — what Nia moved.** The flywheel as motion: "Nia kept ₹185 in your pocket at
Sukh Store" (moved Here → Yours) and "₹500 voucher waiting" (a rupee Nia will move
next). Muted when unused.

**Tier 4 — progress.** One line: more reached Yours (or Home) than last month.

**What disappears:** balances, statements, transaction lists, dates, any account
framing, and — the specific risk of this model — a dashboard of equal columns. Here is
deliberately smaller than Home and Yours; the three are not peers.

---

## 4 · Low-fidelity structure

Three structural takes on the pockets. Monochrome, hierarchy only.

### B1 — stacked rows (one pocket per row)

```
┌───────────────────────────────┐
│  June — your ₹14,000           │
│  A full month, mostly kept.    │
│                                │
│  HOME    ₹5,000                │
│  reached your family           │
│                                │
│  YOURS   ₹4,800                │
│  saved and in hand             │
│                                │
│  HERE    ₹4,200                │
│  your room and food            │
│  ──────────────────────────    │
│  Nia kept ₹185 in your pocket  │
│  ₹500 voucher waiting (grey)   │
└───────────────────────────────┘
```
Home and Yours first, Here last — order encodes worth. Clear, but the proportion is
told in numbers, not shown.

### B2 — the split bar (proportion shown)

```
┌───────────────────────────────┐
│  June — your ₹14,000           │
│  A full month, mostly kept.    │
│                                │
│  ┌──────────┬───────┬────────┐ │
│  │  HOME    │ HERE  │ YOURS  │ │   ← one bar, to scale
│  │  ₹5,000  │₹4,200 │ ₹4,800 │ │
│  └──────────┴───────┴────────┘ │
│   green       grey     green   │
│  ──────────────────────────    │
│  Home  reached your family     │
│  Yours ₹2,000 saved, rest yours│
│  Here  your room and your food │
│  ──────────────────────────    │
│  Nia kept ₹185 in your pocket  │
│  ₹500 voucher waiting (grey)   │
└───────────────────────────────┘
```
The bar makes worth visible in under a second — most of it is green. Strongest 5-second
read of the three. Risk: a bar can drift toward looking like a chart; must stay a
division, not a graph.

### B3 — Here shrinks (the flywheel, animated in the mind)

```
┌───────────────────────────────┐
│  This month Nia made "Here"    │
│  smaller.                      │
│  Here  ₹4,385 → ₹4,200         │
│        (Nia moved ₹185 to you) │
│  ...then B2's split bar below  │
└───────────────────────────────┘
```
Leads with Nia's motion. Powerful for the flywheel, but only true in months with
savings — too fragile to be the default.

**Direction:** B2 (the split bar) is the truest and fastest. B1's ordered rows live
*beneath* the bar as the detail. B3's "Here got smaller" becomes the framing of the
Nia-added block, not the top of the page.

---

## 5 · High-fidelity concept

**B2 as the spine.** Top to bottom:

1. **Header** — "June · your ₹14,000." The salary is named as the thing being divided.
2. **Human line** — "A full month, mostly kept." (state-dependent, never shame.)
3. **The split bar** — one horizontal bar, segmented to scale into Home / Here / Yours.
   Home and Yours in the received tone; Here in muted grey. Each segment labelled with
   its amount. This is the hero — not a number, a division.
4. **Inside the pockets** — three short blocks beneath the bar, Home and Yours first:
   what reached family; what was saved and is in hand (carry noted); what the room and
   food cost.
5. **What Nia moved** — "Nia kept ₹185 in your pocket at Sukh Store" (Here → Yours), and
   "₹500 voucher waiting" in grey. Framed as motion out of the toll.
6. **Progress** — "₹300 more stayed yours than in May."

Why B2 over B1/B3: B1 hides the proportion that makes the verdict instant; B3's frame
only holds in months with savings. B2 shows worth as a shape any Member reads in a
glance, keeps the honest three-way division intact, and turns the flywheel into visible
motion. Its one risk — reading as a chart — is controlled by keeping the bar a labelled
division with sentences beneath, never axes or a legend.

Held against Workshop A: **A leads with a conclusion (verdict + hero sum); B leads with
the evidence (the division) and lets worth emerge from it.** A is faster to an emotional
hit; B is harder to distrust because nothing is summarised for you. The critique above
the fold should decide which the Member needs more — reassurance, or proof.

---

## 6 · Final copy

Sentence case, first-generation smartphone reader. Latin numerals here; Member's script
in production.

**Header**
- `June · your ₹14,000`

**Human line** (state-dependent, never shame)
- Good: `A full month, mostly kept.`
- Steady: `A steady month.`
- Hard: `A hard month. You still sent money home.`

**The split bar — segment labels**
- `Home ₹5,000`
- `Here ₹4,200`
- `Yours ₹4,800`

**Inside the pockets**
- `Home — ₹5,000 reached your family back home.`
- `Yours — ₹4,800 stayed with you. ₹2,000 saved, the rest yours.`
- `In your hand right now: ₹3,480 (₹680 carried from May).`
- `Here — ₹4,200 for your room and your food.`

**What Nia moved**
- Label: `What Nia moved to you`
- Saving present: `Nia kept ₹185 in your pocket at Sukh Store.`
- Voucher unused: `₹500 Sukh Store voucher waiting for you.`
- Voucher redeemed: `You used your ₹500 voucher — it stayed in your pocket.`
- No shopping yet: `Shop at Sukh Store and Nia keeps more in your pocket.`
- No work through Nia: `Work through Nia to unlock your ₹500 voucher.`

**Progress**
- More kept: `₹300 more stayed yours than in May.`
- Less kept: `₹200 less stayed yours than in May. A full month still went home.`
- First month: `Your first month. NiaBook fills as you go.`
- Flip back: `See earlier months`

---

## 7 · Design rationale

- **Worth is shown, not asserted.** The proportional bar lets the Member reach the
  verdict himself. Harder to distrust than a number someone calculated for him.
- **The three pockets must always sum to the salary.** Completeness is the honesty
  guarantee — no rupee hidden, no overlap. Break it and the model lies.
- **Here is smaller than Home and Yours, on purpose.** They are not equal columns. The
  toll is real and shown, but it is not celebrated with equal weight — that would make
  the page a dashboard.
- **Nia as motion, Here → Yours.** The single most honest framing of the flywheel: Nia's
  value is money it moved out of the toll and into what he keeps. Sukh Store is a saving,
  never a purchase.
- **The carry is told, not smoothed.** ₹680 from May is labelled inside "in hand now"
  rather than folded silently into a pocket. Small honesty, large trust.
- **Colour is state only.** Received tone for Home and Yours (good); grey for Here (the
  toll) and for the unused voucher (waiting). No category colour, no chart palette.
- **Dignity in a hard month.** In a lean month the grey Here segment may be large and
  Yours small; the human line softens but the structure never shames. No red anywhere.

### Honest trade-offs (for the critique)

1. **No hero number.** B's strength is also its risk: some Members may want one figure to
   hold onto. If testing shows the bar reads as abstract, add A's hero sum above it — but
   that starts to merge B back into A.
2. **The bar vs a chart.** One design slip (axes, gridlines, a legend) turns the division
   into a graph and breaks the model. This must be policed.
3. **Empty first month.** With no May to compare and little saved, the bar can look thin.
   Handle with the first-month line, not a fabricated comparison.
4. **A vs B is a real fork.** A reassures (leads with the answer); B proves (leads with
   the evidence). Pick by what the Member needs most at month-end — likely both, on
   different days. Worth putting both in front of real Members before choosing.
