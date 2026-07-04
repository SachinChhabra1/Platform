# Next task

The single task the next session should pick up. Kept in sync with [`ROADMAP.md`](ROADMAP.md).
Start from [`START_HERE.md`](START_HERE.md).

## Status: Production Readiness Lead mode — R9 in progress (in-authority work available)

*Last verified: 2026-07-04 — `nia verify` green, **90 tests / 20 files**, analyze clean, no drift,
tree clean.*

**Founder ruling (2026-07-04):** when the feature roadmap is gated, become **Production Readiness
Lead** and work **R9 — Production Readiness** ([`ROADMAP.md`](ROADMAP.md)) — the final 10% that makes
the app trustworthy, not new features. R1 is complete; the board freeze is lifted.

**Done this session:** Founder rulings encoded (visual prototypes = design references, Constitution
rule 7; "finish categories, not files", `AUTONOMOUS-LOOP.md`); R9 restructured into a **category
matrix**. Closed categories: **Async / Empty / Offline** (the async audit — [`R9_ASYNC_STATE_AUDIT.md`](R9_ASYNC_STATE_AUDIT.md)),
**R9.0** test-count consolidation, **R9.5** crash recovery (calm `NiaErrorScreen` replaces the raw
crash box). Suite 77 → 87.

**R9.4 Accessibility done (in-authority)** — whole-app audit ([`R9_ACCESSIBILITY_AUDIT.md`](R9_ACCESSIBILITY_AUDIT.md)):
SOS is a labelled button, NiaBook language/month toggles are buttons, `Monogram` is excluded,
`SectionLabel`s are headers, the Profile call button has a tooltip; contrast passes WCAG AA. Gated on a
Founder-approved screen change (Q11): sub-48px tap targets + text-scale reflow on the frozen screens.

**Next in-authority (pick up here) — the last two in-authority categories:** the **Motion** and
**Typography** audits (audit is in-authority; *changing* a frozen screen needs a Founder-approved screen
change, so those fixes may be gated). After that the in-authority R9 lane is largely exhausted
(Performance is gated on the native build) — surface the gate: **OD-1 / backend un-pause** is the
critical path. See the R9 matrix in `ROADMAP.md`.

**Still Founder-gated (unchanged) — these are what move the product to real production:**

| Next task | Gate |
|---|---|
| **R3 — Wage Flow (backend)** | Un-pause the backend **and** rule OD-1 (`DECISIONS.md`). Say: *"un-pause backend, OD-1 is X."* |
| **R2 — native install (Android first)** | Your go-ahead + accounts/device. Say: *"build the Android install."* |
| **Q3 — retire legacy surfaces** | An in-authority cleanup once you approve the product call (retire `wallet`/`home`?). Say: *"retire the legacy wallet/home screens."* |
| R4–R8 (backend) | OD-2…OD-6 rulings + backend un-paused. |

Open Founder questions are in [`FOUNDER_REVIEW.md`](FOUNDER_REVIEW.md) (Q2, Q3, Q5, Q7). The OD
rulings expire **2026-07-13**.

## When picked up

Follow the loop in [`docs/AUTONOMOUS-LOOP.md`](docs/AUTONOMOUS-LOOP.md): recover state → contract
→ implement → verify (`nia verify` green) → review → update state docs → single-purpose commit →
continue. Respect the Product Bible ([`docs/03_PRODUCT_BIBLE.md`](docs/03_PRODUCT_BIBLE.md)), the
ADRs, and the progress-not-engagement law. Do not invent features or redesign product behaviour.
