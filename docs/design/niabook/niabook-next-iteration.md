# NiaBook — build for members (the compounding version)

**Status: BUILT and live** (commit `a0f75f3`). The Founder reoriented from board-demo
polish to member value — "build for members, the board can live with that" — so this
direction is now the live NiaBook page, not a future track. The theme: move NiaBook from
**recording** to **compounding** — from a statement that ends to a flywheel that points
forward. This note is the rationale; the app implements it.

## 1 · The core gap — recording vs compounding

Today the page tells the Member what happened this month. It does not tell them why
to use more Nia next month. That is the difference between a statement and a flywheel.

What the Member sees today is linear, and it ends:

```
Worked → Got salary → Sent money home → Saved ₹185.
```

The business actually works as a loop:

```
Work through Nia → ₹500 Sukh Store voucher → Buy at Sukh Store → Spend less →
More money stays with you → NiaBook proves it → I trust Nia more →
I use more Nia services → Next month even more value appears.
```

That loop is invisible today. **The missing sentence the Member should leave with:**
*"If I use Nia more next month, this page will get better."*

## 2 · The flywheel is the logic of the page, not a section

Right now the flywheel is a section ("What Nia made smaller"). It should be the logic
of the *whole* page. Every section should answer one question:

> How did this make next month's NiaBook better?

Each section points **forward**, not backward:

- **Work** — you got your job through Nia → you unlocked your ₹500 voucher.
- **Sukh Store** — you used the voucher → ₹185 stayed with you.
- **Living** — because you stayed in a Nia Studio → your living costs were lower.
- **Health** — because you used Nia Health → you avoided an unexpected expense.

Everything points forward. Recording says "here is what happened." Compounding says
"here is what this set up for next month."

## 3 · Draw the loop — a simple journey, not a marketing graphic

Near the bottom of the page, draw the loop plainly so the page explains itself:

```
You worked through Nia
        ↓
You unlocked ₹500
        ↓
You shopped at Sukh Store
        ↓
₹185 stayed with you
        ↓
June was better than May
        ↓
Keep using Nia
```

## 4 · End with coaching, not just a verdict

Every month should close with one forward line:

> Here's one thing that will make July even better.

Examples: *Use your ₹500 Sukh Store voucher · Send money home through Nia · Complete
your health check · Start saving ₹20 a day · Finish your learning module.* Now NiaBook
is not just reporting — it is coaching, and every recommendation feeds the flywheel.

## 5 · The tonal shift (from the previous note)

Alongside the forward logic, the voice becomes personal — speaking *to* the Member,
not *about* the system.

| Today (describes the system) | Next (speaks to the Member) |
|---|---|
| Living here cost ₹4,200. Every month, Nia works to make this smaller. | You spent ₹4,200 to live here. Next month we'll help you keep more. |
| You kept ₹185 that would have gone to market prices. | Because you shopped with Nia, ₹185 stayed with you. |

Long term, opening July should read like a conversation:

> July was even better.
> Your family received every transfer on time.
> ₹420 more stayed with you than last month.
> You used every benefit available to you.
> You're moving forward.

## 6 · The product principle — evolved

The principle grows one step, from evidence to compounding:

- Necessary but not sufficient: *Every service must leave evidence in NiaBook.*
- **The real principle: every service must either improve this month's NiaBook or make
  next month's NiaBook better.**

One is recording; the other is compounding. The compounding version creates
anticipation, not just reflection — the book isn't only recording progress, it is
helping shape the next page. The build test stands: **will this improve next month's
NiaBook?** If not, don't build it.

## Founder review — the craftsmanship backlog (post architecture sign-off)

The architecture is signed off; the remaining work is craftsmanship, not invention.
The founder review ("does it feel like one product, and does each screen deliver its
*emotional* promise?") surfaced four things to refine — none are deck mismatches:

1. **Living reads like a facilities menu.** The six service rows (nest, meals,
   community, safety, services, requests) inform more than they say "my cost fell."
   The "spend less" emotion only lands at the top (₹2,400, everything included) and
   bottom (kept ₹550). Make the middle carry the cost-reduction feeling.
   **✅ Done (R1 #1):** each service row now reads **Included** (blue), echoing the
   utilities above — the middle says "all this is inside your ₹2,400, nothing extra."
   No invented numbers.
2. **NiaBook doesn't show the ○→✓ motion.** The core idea — a line moving from waiting
   to true — is narrated in the deck but only implied on screen ("4 unlocked · 9
   waiting"). Make the movement visible; it is the most distinctive idea in the product.
   **✅ Done (R1a, freeze lifted):** the shared `MovementCheck` plays a restrained ○→✓
   on load — on the "unlocked" tally and on each line that became true (staggered down
   the left column). Settles on ✓, so goldens stay byte-identical. Items 1, 3, 4 remain.
3. **Consistency is flattening emotional register.** One shared visual language nails
   "one product" but Family doesn't yet *feel* warmer than Work — the difference is
   carried only by copy. Find a tonal shift per promise without breaking the system.
4. **Uneven daily-return pull.** NiaBook and Store earn a daily open; Living earns it
   least. Give every pillar a reason to come back.

## The board takeaway

If the board leaves with one thing: **Nia is no longer building features. It is
building a monthly record of progress for migrant workers** — a record that compounds.
A far more durable vision than "we redesigned the wallet."
