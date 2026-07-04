# R1 craftsmanship — visual review

Before/after for the R1 craftsmanship pass. **Before** = the board-frozen baseline
(`795b0de`); **after** = R1 complete (`536b2a8`). Compare goldens:
`git difftool 795b0de HEAD -- apps/member/test/goldens/`.

## What changed, per screen

| Screen | Register (Q8) | Motion | Continuity Coaching (Q9) | Golden delta |
|---|---|---|---|---|
| **NiaBook** | factual, ledger (unchanged) | **○→✓ movement** now visible on load (R1a) | "₹300 more stayed… → use your ₹500 voucher" | coaching line added; motion settles to same frame |
| **Work** | precise, energetic — **denser** (s3), snappy (240ms) | brisk | "21 of 22 days… → 20 min training → +₹2,500" | denser rhythm + coaching |
| **Living** | calm, spacious — **airier** (s5), gentle (460ms) | gentle | "kept ₹550… → log a Sunday shift, laundry covered" | **Included** on every service (R1 #1) + airier + coaching |
| **Store** | brisk (340ms) | brisk | "kept ₹185… → use your ₹500 voucher by 30 July" | coaching line only (density unchanged) |
| **Family** | warm, personal — **airier** (s5), gentle (460ms) | gentle | "₹5,000 on time… → Ravi's fees due 15 July" | airier + coaching |

## Assessment

- **One product, five registers.** The shared component system is intact; the pillars now *feel*
  different through **density + motion timing + copy tone**, not colour. Work is visibly tighter
  and more purposeful; Living and Family breathe; NiaBook stays a factual ledger. Colour remains
  reserved for state only — no palette, gradient, illustration, or noise was added.
- **The signature motion is visible.** NiaBook's ○→✓ now plays on open — the most distinctive idea
  in the product, previously only implied.
- **Progress, not engagement.** Every screen closes with one calm, grounded next step — a trusted
  advisor, never a hook. No streaks, no gamification, no manufactured returns.
- **Living reads as "spend less" throughout**, not a facilities menu — every comfort is *Included*.

## Verification

`nia verify` green · `flutter analyze` clean · **77 tests** · goldens deterministic · no codegen
drift. Motion changes are golden-neutral (they settle to the same frame); density and coaching
changes are intentional and reviewed above.
