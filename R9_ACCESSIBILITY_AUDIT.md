# R9.4 · Accessibility Audit

Whole-app audit of every implemented screen. Grounded by inspection (interactive controls, existing
semantics, token sizes, palette contrast). **Semantic fixes are golden-neutral** (they don't paint),
so they apply everywhere including the five frozen screens. **Layout fixes** (enlarging a tap target)
change rendering, so on a frozen screen they are **gated** on a Founder-approved screen change.

## Dimensions

| Dimension | State | Detail |
|---|---|---|
| Semantic labels & roles | ✅ **Fixed** | SOS is now a labelled `button`; the NiaBook language + month toggles are buttons (language carries an explicit label — a globe icon is silent to a screen reader); the decorative `Monogram` is excluded (no more announcing a lone "R"); `SectionLabel`s are headers (screen-reader navigation); the Profile call `IconButton` has a tooltip/label. `nia_bottom_nav` was already exemplary (Semantics + Tooltip); the pillar hero cards were already `button: true`. |
| Contrast (WCAG AA) | ✅ **Pass** | Book III palette: `inkSecondary` #6B6B6B on white ≈ 4.9:1 (≥4.5 for text); `blue` #2C5880 ≈ 6.7:1. No fix needed. |
| Tap targets ≥ 48px | 🟡 **Partial — frozen gated** | Non-frozen controls are fine (`IconButton` = 48, bottom-nav tabs 60px, full-width buttons). **Gated:** on the frozen screens the SOS pill (~32px tall, `s2` padding), the NiaBook language/month toggles, and the icon chips are < 48px. Enlarging them changes the goldens → needs a **Founder-approved screen change**. Recorded, not silently skipped. |
| Text scaling | 🟡 **Partial — frozen gated** | Fixed-height slots (e.g. the bottom-nav 14px label slot, some fixed rows) can clip at large system text scale. Non-frozen fixes are in-authority later; frozen-screen reflow is gated. |
| Screen-reader traversal | ✅ | Order follows the widget tree (top→bottom); headers now present; decorative icons are silent (unlabelled `Icon`s aren't announced). |

## Per-screen

| Screen | Labels/roles | Contrast | Tap targets | Notes |
|---|:--:|:--:|:--:|---|
| NiaBook (frozen) | ✅ | ✅ | 🔒 | Language/month/SOS labelled; sizes gated |
| Work · Living · Store · Family (frozen) | ✅ | ✅ | 🔒 | Heroes already labelled; SOS labelled; SOS size gated |
| Home | ✅ | ✅ | ✅ | — |
| Wallet | ✅ | ✅ | ✅ | — |
| My Family | ✅ | ✅ | ✅ | — |
| Profile | ✅ | ✅ | ✅ | Call button now has a tooltip |
| Sign-in | ✅ | ✅ | ✅ | — |
| Recovery | ✅ | ✅ | ✅ | Icon+label button |

## Status

**In-authority accessibility work is complete** (labels, roles, headers, decorative exclusion,
contrast confirmed) and regression-tested (`test/accessibility_test.dart`). The remaining items —
**enlarging sub-48px tap targets and text-scale reflow on the five frozen screens** — are **gated on a
Founder-approved screen change** (they would move the goldens). Tracked in the R9 matrix (`ROADMAP.md`)
and `FOUNDER_REVIEW.md`.
