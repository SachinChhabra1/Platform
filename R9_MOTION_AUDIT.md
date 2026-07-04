# R9 · Motion Audit

Whole-app audit of every animation in the implemented app. Grounded by inspection of the motion
primitives, their consumers, per-screen durations, and route transitions. **Behavioural fixes that
leave the settled frame unchanged are golden-neutral** (they don't repaint what the tests capture),
so they apply everywhere including the five frozen screens. **Fixes that change the rendered frame**
(e.g. a different resting layout) are **gated** on a Founder-approved screen change.

## Architecture (what motion is, mechanically)

- **All motion is implicit and one-shot.** There is **no `AnimationController`, `TickerProvider`, or
  `vsync`** anywhere in `lib/`. Every animation is a `TweenAnimationBuilder` that plays once on mount
  and settles. Consequence: no leaked controllers, no repeating tickers, no infinite loops — nothing
  spins in the background draining battery, and every animation settles under `pumpAndSettle` so the
  goldens capture the final, true frame.
- **Two primitives carry the whole surface** (`lib/features/pillars/nia_components.dart`):
  - `NiaReveal` — a subtle fade + 8px rise on mount, `easeOutCubic`, 320ms default.
  - `MovementCheck` — the signature NiaBook motion: a line moving from **waiting (○)** to **true (✓)**,
    crossfade + scale-in, `easeOutCubic`, 520ms default, staggered down a column.
- **Route transitions** are the platform default (`MaterialPageRoute`) — Promise, Recovery, Sign-in.
  No custom route animations; standard and appropriate.
- **No spinners.** The Work progress bar uses `AlwaysStoppedAnimation` (a static determinate bar), in
  keeping with the async-state law (a failed fetch shows a calm retry, never an endless spinner —
  `R9_ASYNC_STATE_AUDIT.md`).

## Dimensions

| Dimension | State | Detail |
|---|---|---|
| Controller / ticker hygiene | ✅ **Pass** | Zero `AnimationController`/`vsync`. All motion is `TweenAnimationBuilder` (one-shot, self-disposing). No leaks, no infinite animations. |
| Golden safety | ✅ **Pass** | Every animation settles to a fixed final frame; goldens capture the true state. Confirmed byte-identical this session. |
| Reduce-motion honored | ✅ **Fixed (golden-neutral)** | Both primitives now read `MediaQuery.disableAnimations` and snap to the final frame (`Duration.zero`) when the OS "Reduce Motion" flag is set. Golden-neutral: under test the flag is off, so the settled frame — and all five goldens — are unchanged. Regression-tested (`test/motion_test.dart`). |
| Register / duration intent | ✅ **Deliberate** | Per-pillar entrance durations encode the emotional register (Q8): **Work 240ms** (brisk), **Store 340ms** (satisfying), **Living / Family 460ms** (calm, warm). NiaBook staggers each "became true" row (`420 + i·140ms`). Intentional and documented, not accidental. |
| Curve consistency | ✅ | One curve family (`easeOutCubic`) across both primitives — a single, calm motion signature. |
| Transition polish | 🟡 **Acceptable — deferred** | Page pushes use the platform default `MaterialPageRoute`. A branded shared transition would be a *product* motion decision, not a readiness fix — out of scope for R9, noted for a future Founder call. |

## Per-screen

| Screen | Motion used | Reduce-motion | Notes |
|---|---|:--:|---|
| NiaBook (frozen) | `MovementCheck` (staggered ○→✓ rows) | ✅ | Snaps to ✓ under Reduce Motion; settled frame unchanged |
| Work · Living · Store · Family (frozen) | `NiaReveal` (per-pillar duration) | ✅ | Register durations preserved; snaps to final frame under Reduce Motion |
| Home · Wallet · My Family · Profile | Reveal / none | ✅ | Covered by the primitive fix |
| Sign-in · Recovery · Promise | `MaterialPageRoute` push | n/a | Platform transition |
| Error boundary | none (static) | n/a | Calm `NiaErrorScreen`, no motion (R9.5) |

## Status

**In-authority motion work is complete.** The one real gap — the OS **Reduce Motion** accessibility
flag was not honored — is **fixed and golden-neutral** (it changes behaviour only when the user has
Reduce Motion on; the settled frame the goldens capture is identical), so it ships to every screen
including the five frozen ones, and is regression-tested (`test/motion_test.dart`). This also closes
the motion item flagged in the accessibility audit.

Nothing else in the motion surface is a readiness defect: no leaked controllers, no infinite
animations, no spinners, deliberate durations, goldens safe. The only remaining, explicitly
**deferred** item is a *branded* route transition, which is a product/motion decision for the Founder,
not a production-readiness fix. Tracked in the R9 matrix (`ROADMAP.md`).
