# R9 · Typography Audit

Whole-app audit of type: the defined scale, how screens actually paint text, weight/colour
discipline, and text scaling. Grounded by inspection of `lib/theme/nia_theme.dart`,
`lib/theme/nia_tokens.dart`, and every `TextStyle` in `lib/`. **Any change to a font size repaints**,
so on the five frozen screens typography reconciliation is **gated** on a Founder-approved screen
change. The audit itself is in-authority.

## The defined scale (Book III §2.2)

`buildNiaPrototypeTheme()` defines a clean, stepped 7-step scale — one family, only weight and size
vary, display larger than the industry default because the Member reads in motion, in poor light,
one-handed:

| Token | Size | Weight | Role |
|---|--:|--:|---|
| `displaySmall` | 40 | 600 | Hero number / page hero |
| `headlineMedium` | 30 | 600 | Screen headline |
| `titleLarge` | 22 | 600 | Card / section title |
| `bodyLarge` | 18 | 400 | Primary body |
| `bodyMedium` | 16 | 400 | Secondary body |
| `labelLarge` | 14 | 600 | Emphasised label |
| `bodySmall` | 14 | 400 | Caption / secondary |

Colours all route through tokens (`ink`, `inkSecondary`); one family throughout. That part is
disciplined and correct.

## The finding: the scale is defined but bypassed

Screens almost universally paint type with **inline `TextStyle(fontSize: …)`** rather than
`Theme.of(context).textTheme.*`. Inspection of every `fontSize:` literal in `lib/` shows **~11
distinct sizes in use — 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24** — against a **7-step** defined
scale. The sizes **10, 11, 12, 13, 15, 20, 24 are off the theme scale entirely**; they are per-screen
fine-tuning that grew organically as each screen was hardened to its golden.

This is understandable for a prototype — the theme file itself notes *"Production theming comes from
`packages/tokens` once it exists (ADR-0003); this is local to the prototype."* — but it is the one
substantive typography debt: the source of truth for type is the theme, and most text does not read
from it.

## Dimensions

| Dimension | State | Detail |
|---|---|---|
| One family | ✅ **Pass** | A single typeface family everywhere; only weight + size vary (Book III §2.2). |
| Colour discipline | ✅ **Pass** | All text colour routes through `NiaTokens` (`ink` / `inkSecondary` / accent). No stray hex on text. |
| Weight discipline | ✅ **Pass** | Two weights (400 / 600) used consistently; 600 reserved for headings and emphasis. |
| Scale adherence | 🟡 **Fragmented — frozen gated** | ~11 inline sizes vs. a 7-step scale; 7 of them off-scale. Reconciling inline styles to `textTheme` repaints the frozen screens → **gated** on a Founder-approved screen change. |
| Line height | 🟡 **Partial** | Body styles set `height` (1.3–1.4) where multi-line; many one-line inline styles omit it (harmless while one-line). Unifying is part of the same gated reconciliation. |
| Text scaling (system font size) | 🟡 **Partial — frozen gated** | No `TextScaler` clamp; large system text can clip fixed-height slots. Same gated item as the accessibility audit ("text-scale reflow on frozen screens", Q11). |

## Per-screen

| Screen | Family/colour | Scale adherence | Notes |
|---|:--:|:--:|---|
| NiaBook (frozen) | ✅ | 🔒 | Densest inline type (sizes 10–24); reconciliation gated |
| Work · Living · Store · Family (frozen) | ✅ | 🔒 | Inline register sizes; gated |
| Home · Wallet · My Family · Profile | ✅ | 🟡 | Off-scale inline sizes; no golden, so reconcilable in-authority later — lower value than closing the gate, deferred |
| Sign-in · Recovery · Error boundary | ✅ | 🟡 | A few inline sizes (22 / 15 / 14); minor |

## Status

**In-authority typography work is the audit itself, and it is complete.** Family, colour, and weight
discipline all **pass**. The substantive debt — **the 7-step theme scale is defined but bypassed by
~11 inline sizes**, and **text-scale reflow** — requires repainting the five frozen screens and is
therefore **gated on a Founder-approved screen change** (it moves the goldens), the same gate as the
accessibility audit's tap-target and text-scale items (Q11). Reconciling the **non-frozen** screens
to the theme scale is technically in-authority but lower value than closing the gate; deferred rather
than done silently. Tracked in the R9 matrix (`ROADMAP.md`) and `FOUNDER_REVIEW.md`.

**Recommended resolution when the gate opens:** route all frozen-screen text through `textTheme`,
extend the scale to the handful of intentional intermediate sizes (e.g. 13 for dense captions, 20/24
for pillar heroes) as *named* steps, and clamp `TextScaler` — done together as one Founder-approved
screen change so the goldens are re-baselined once.
