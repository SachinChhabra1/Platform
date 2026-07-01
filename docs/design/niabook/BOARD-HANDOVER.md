# NiaBook — board handover (open this first)

Prepared 2026-07-01. The approved two-column NiaBook is in production. One place,
everything you need.

---

## Status at a glance

| | |
|---|---|
| Commit | `ba6b60d` — "Store to App-Store quality: harden the flywheel, not the shop" |
| Branch | `pr/membership-product-review-build` |
| Recovery bundle | `nia-store-flywheel-appstore-quality-20260701-161613.bundle` (verified) |
| Verification | `nia verify` **green** · 49 tests pass · `flutter analyze` clean · no codegen drift |
| Canonical docs | [`PRODUCT_ARCHITECTURE.md`](../../../PRODUCT_ARCHITECTURE.md) · [`DESIGN_SYSTEM_LOCK.md`](../../../DESIGN_SYSTEM_LOCK.md) |

**Production hardening (screen-by-screen).** Architecture is locked; each screen is now
being taken to App-Store quality one at a time, against its approved screenshot. A
reusable component set (`features/pillars/nia_components.dart` — InfoCard,
OpportunityCard, SummaryCard, SectionHeader, ListRow, NiaReveal) is the shared surface.
**Living: DONE.** **Work: DONE** — one promise (Earn more); the +₹2,500/month role is the
RafiQi-found hero; the close states the economic chain (certification → +₹2,000 wages →
+₹500 Sukh voucher → more savings → NiaBook). **Store: DONE** — money kept, not commerce.
The screen *is* the flywheel, felt top-to-bottom: voucher (fuel) → basket (every SKU
answers "how much did I keep?", the kept amount louder than the price) → smart swaps →
savings compounding (Today ₹63 → month ₹185 → **year ₹2,460**) → literal close ("₹185
moved into your NiaBook"). **Next: Family** — the last pillar, then integrate.
| See it live | `nia preview` (opens on NiaBook) |
| Screenshot | `apps/member/test/goldens/niabook.png`, mirrored to `~/Desktop/niabook-states/` |

---

## The one takeaway

If the board leaves with one thing: **Nia is no longer building features. It is
building a monthly record of progress for migrant workers** — a record that compounds.

The product principle: **every Nia service earns its place by making the next page of
NiaBook better.** The two columns are that principle on screen — every month moves a
line from the right (more you can keep) to the left (what became true).

---

## The architecture (what the board is looking at)

- **Left — What became true.** Money the Member gained this month, closed. NiaBook
  proves it: reached family, yours, saved at Sukh Store, living cost.
- **Right — More you can keep.** Opportunities still waiting, found by RafiQi: a better
  job, the monthly voucher, the next role.
- **Every month moves a line from right to left.** That motion is the flywheel — and
  the reason to use more Nia next month.

---

## The four key messages

1. **More of my salary becomes mine.** Reached family, stayed yours — in the Member's
   own language. (Member truth — lead here.)
2. **NiaBook is the centre of the app.** One artefact, opened every month.
3. **The mechanism: Nia reduces the cost of migration.** We lower what it costs to be
   away; NiaBook makes it visible.
4. **Every service feeds NiaBook.** Work, Living, Store, Family, Health — each leaves
   evidence on the left or an opportunity on the right.

Ladder to hold: member truth → product truth (cost of migration) → business truth
(retention, lifetime value, service attachment, a defensible platform).

---

## The one-minute demo flow

1. **Open the app.** It lands on NiaBook — the book icon, first tab.
2. **The summary.** "₹300 more stayed with you than in May." · "4 unlocked · 9 waiting."
   The month already has a verdict.
3. **Left — what became true.** ₹5,000 reached family, ₹4,800 yours, ₹185 saved at Sukh
   Store, ₹2,400 living. "You are ₹300 ahead of May. Your best month yet."
4. **Right — more you can keep.** RafiQi's best gain: Machine Operator, +₹2,500/mo,
   20 minutes of training left. Below it, a ready ₹500 voucher and a locked supervisor
   role.
5. **The motion.** Point out that finishing the training moves +₹2,500/mo from the right
   column into next month's left column. That is the whole product.
6. **SOS** sits top-right — one tap to a human, quiet, never alarming.

---

## The operating system — five screens

NiaBook proves; the four pillars earn, save, keep, and send. All are the real app
(regenerate with `flutter test test/niabook_golden_test.dart --update-goldens`).

**NiaBook — the home ledger**

![NiaBook](../../../apps/member/test/goldens/niabook.png)

**Work · Earn more**

![Work](../../../apps/member/test/goldens/work.png)

**Living · Spend less**

![Living](../../../apps/member/test/goldens/living.png)

**Store · Keep more**

![Store](../../../apps/member/test/goldens/store.png)

**Family · Send more home**

![Family](../../../apps/member/test/goldens/family.png)

Canonical references (start every future session here): [`PRODUCT_ARCHITECTURE.md`](../../../PRODUCT_ARCHITECTURE.md)
and [`DESIGN_SYSTEM_LOCK.md`](../../../DESIGN_SYSTEM_LOCK.md).

---

## If asked "is this live?"

Yes — the real app, opening on the real screen. The numbers are the Founder-accepted
June scenario held in the app (the money-movement backend is paused in the Product
Polish Phase), so the demo runs offline and cannot break in the room.
