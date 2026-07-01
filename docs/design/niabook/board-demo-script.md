# NiaBook — board demo script

A one-minute walk. The demo is about confidence, not expansion. Open the app and
let NiaBook speak; the four lines below are the spine.

## The narrative ladder — say it in this order

Lead with what the Member feels; reach the mechanism and the business case only after.

1. **Member truth** — "More of what I earn reaches the people I care about, and stays
   with me." More of my salary becomes mine.
2. **Product truth** — the mechanism is that **Nia reduces the cost of migration**:
   every rupee Nia saves moves from "the cost of being here" into "money that stays
   with you."
3. **Business truth** — lower migration costs create higher retention, greater lifetime
   value, stronger service attachment, and a defensible platform.

## The four things to say

1. **More of my salary becomes mine.** What reached home, what stayed with me — in the
   Member's own language. (Member truth — lead here.)
2. **NiaBook is the centre of the app.** One artefact, opened every month, answering
   "was leaving home worthwhile this month?"
3. **The mechanism: Nia reduces the cost of migration.** We do not raise anyone's
   salary; we lower what it costs to be away, and NiaBook makes that visible.
4. **Every part of Nia feeds NiaBook.** Work, Living, Sukh Store, Family, Health,
   Insurance — each one leaves visible evidence here. If a service cannot show up in
   NiaBook, we question whether it belongs.

## The walk (about a minute)

1. **Open the app.** It lands on NiaBook — the book icon, first tab. (Message 2 —
   NiaBook is the centre.)
2. **The verdict.** "June was worth it." The answer before any number. (Every month
   proves whether leaving home was worthwhile.)
3. **The hero.** "₹5,000 reached home. ₹4,800 stayed with you." Two destinations, no
   arithmetic. The full sum sits quiet beneath. (Member truth — lead here, message 1.)
4. **Where the salary went.** Reached home, stayed with you, and the cost of being
   here — shown honestly, framed as the toll Nia works to lower.
5. **What Nia made smaller.** "₹185 kept in your pocket at Sukh Store — money that
   would have gone to the market." (The mechanism — message 3, said after the member
   truth, never before.)
6. **The five states** (tap the chips at the foot of the page): savings, an unused
   ₹500 voucher waiting, a redeemed voucher, no savings yet, and a Member who did not
   get work through Nia. The verdict and the earned-money story hold through all of
   them — only Nia's added value changes. This is the flywheel: work through Nia →
   voucher → shop at Sukh Store → save → see it here → want more Nia.
7. **Progress.** "You kept ₹300 more than in May." NiaBook is a book of months; it
   fills as the Member stays. (Message 4 — every service feeds NiaBook — then the
   business truth: retention, lifetime value, attachment, a defensible platform.)

## Screenshots

Board-ready captures of all five states (real app render, SF type):
`apps/member/test/goldens/niabook_0{1..5}_*.png`, mirrored to
`~/Desktop/niabook-states/` for the deck. Regenerate any time with
`flutter test test/niabook_golden_test.dart --update-goldens`.

## If asked "is this live?"

Yes — it is the real app, opening on the real screen. The numbers are the
Founder-accepted June scenario held in the app (the money-movement backend is paused
in the Product Polish Phase), so the demo runs offline and cannot break in the room.
