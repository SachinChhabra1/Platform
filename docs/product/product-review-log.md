# Product Review Log — Membership Prototype

The running record of Product Review Build iterations (docs/methodology.md → Product Review
Prototypes). Each entry is a Founder-reviewable checkpoint of the `apps/member` prototype.
The prototype is a thinking tool, not production software; nothing here is a contract.

---

## Iteration 1 — verified (2026-06-29)

**Status:** ✅ Accepted by Founder. Reviewed visually against the running build.

**What was delivered**
- **Six screens captured** — Home, Wallet Overview, Profile, RafiQi, Clusters, The Promise.
- **Navigation GIF captured** — `nia-membership-prototype-navigation.gif` (11 frames):
  Home → Wallet → Clusters → RafiQi → Home → Profile, with page transitions.
- **Live build running** — Flutter web (debug) at `http://127.0.0.1:8123`, served via
  `flutter run -d web-server`, driven in Chrome at phone viewport.

**Verification (all green)**
- `pnpm run verify`: ✅ passed (lint gates, TS tests/typecheck, i18n analyze+test, member analyze+test).
- `flutter analyze` (apps/member): clean.
- `flutter test` (apps/member): +3 (boots & greets by name; self-marks as prototype; navigates to Wallet).
- **No backend, API, auth, persistence, or business behaviour** — audited: only deps are
  `flutter`, `cupertino_icons`, `nia_i18n`; all figures are static `const`; the only `Future`
  is a UI bottom sheet.

**Decision state at checkpoint**
- FD-1 resolved (narrow boundary). FD-2 form chosen (Option c); **C-1 in place as temporary
  prototype copy only**, unlocked. All other FDs/Qs rendered as marked placeholders, never invented.

---

## Iteration 2 — delivered (2026-06-29)

**Status:** 🟡 Built, verified, captured. **Awaiting Founder review.** Presentation/experience
refinements only — no product policy changed, no Founder Decision resolved. Built under
delegated engineering authority (certain first consumer = this prototype; no behaviour, no
business rules, no new architecture, fully verified locally).

### What changed (reduce before adding)
| # | Direction | What was done |
|---|---|---|
| 1 | Reduce visual noise | Section labels softened to quiet sentence case; whitespace increased; card chrome removed. |
| 2 | Minimise prototype ribbon | Full-width amber bar **removed**; replaced by a small "prototype" chip in the app bar. |
| 3 | Wallet → money story | Balance + one-line narrative ("This month you earned ₹14,000 — in full, and on time.") + quiet lines; ledger rules removed. |
| 4 | Remove Wallet colour legend | **Removed.** Green now means in context (§2.1), not in a key. |
| 5 | The Promise more prominent | Lifted high on Home and given headline weight; card border removed. |
| 6 | "Your Map" → the Member's life | Now "Your life with Nia" — a calm list (Where you live · Your work · What you need · Your family), not a bordered category grid. |
| 7 | Reduce CTA dominance | "Send money home" is now a quiet text action, not a full-width black slab. |
| 8 | Spacing & typography | Larger top/section rhythm; FD markers softened to a quiet amber left-rule. |
| — | Keep C-1 | FD-2 stays unlocked; C-1 remains temporary copy. |

### Product Review contents
- **Running application:** `http://127.0.0.1:8123` (Flutter web debug, live in Chrome).
- **Screenshots:** Home · Wallet · Profile · Clusters · RafiQi · The Promise (captured this session).
- **Navigation recording:** `nia-membership-prototype-iter2-navigation.gif` (13 frames).
- **Engineering Quality Certification:** ✅ `flutter analyze` clean · `flutter test` +3 ·
  no backend/API/auth/persistence/Wallet logic/business behaviour · all FD/Q markers preserved.
- **`pnpm run verify`:** ✅ passed.
- **Unresolved Founder Decisions surfaced in-app:** FD-2 (Promise wording), FD-3/FD-5 (tenure),
  FD-7 (consent), FD-11 (women Members), Q2 (state visibility), Q3 (My Family), Q4 (tenure shown).
- **Outstanding Product question (new):** *Home ordering.* The Promise is now lifted **above**
  the balance for prominence (direction 5). Book IV §3.1 says Home leads with "what he has."
  Both are defensible. **Does the institutional Promise lead the Home, or does the functional
  balance lead?** Founder/Product call — flagged, not decided.

---

## Iteration 3 — delivered (2026-06-29)

**Status:** 🟡 Built, verified, captured. **Awaiting Founder review.** Taste-led refinements
under delegated engineering authority; no product policy changed, no Founder Decision resolved.

**Founder rulings folded in**
- **Home ordering FIXED** (Founder decision): 1. Available balance · 2. What changed ·
  3. What next · 4. The Promise · 5. Your life with Nia. The balance leads — the first question
  is "how much do I have today?"; the Promise explains the relationship the balance proves.
  (This **resolves** Iteration 2's open Home-ordering question.)

### What changed (remove more than add)
| Direction | What was done |
|---|---|
| Home order | Balance now leads; Promise moved to 4th, below "what next". |
| Your life → a journey | Cards now describe parts of life with a human detail line — "Where you sleep · A bed in Peenya, Bengaluru"; "Your family · Sunita, back home in Ganjam" — not product categories. |
| Wallet → money story | Answers "what happened to my salary?": salary arrives, goes to a few real things, "₹3,480 stayed with you." **Removed** the label/amount ledger columns entirely. |
| Reduce | Deleted the unused `MoneyRow` ledger component. |

### Product Review contents
- **Running application:** `http://127.0.0.1:8123` (Flutter web debug, live in Chrome).
- **Screenshots:** Home (top) · Home (Your life) · Wallet · Clusters · RafiQi · Profile · The Promise.
- **Navigation recording:** `nia-membership-prototype-iter3-navigation.gif` (13 frames).
- **Engineering Quality Certification (mandatory):** ✅ `pnpm run verify` green · `flutter
  analyze` clean · `flutter test` +3 · all FD/Q markers preserved (FD-2, FD-3/FD-5, FD-7,
  FD-11, Q2, Q3, Q4) · no backend / API / auth / persistence / Wallet logic / business behaviour.
- **Outstanding Product questions:** none new this iteration. (The Iteration 2 Home-ordering
  question is now resolved by Founder ruling above.)
