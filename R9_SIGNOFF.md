# R9 — Production Readiness · SIGN-OFF

**Signed off: 2026-07-04. Founder-directed close.** R9 ran `audit → fix → verify → sign-off` and is
**complete for its in-authority scope**. It does not stay open for perpetual polish — the moment every
category is either ✅ in-authority-complete or 🔒 Founder-gated, R9 is done. That bar is met.

## The rule this sign-off enforces

R9 is **Production Hardening**, not a bottomless refinement backlog. Its job was to turn a demo into
software people trust — tested, accessible, recoverable, offline-aware, crash-safe — and to *record*
(not fake) the work that needs a native build or a Founder ruling. Further frontend refinement past
this line is lower-value than connecting real services. **R9 is now a parallel hardening stream, not
the terminal gate before backend.**

## Category resolution

| Category | In-authority scope | Residual (gated) | Evidence |
|---|---|---|---|
| Async / Empty / Offline | ✅ Complete | — | [`R9_ASYNC_STATE_AUDIT.md`](R9_ASYNC_STATE_AUDIT.md) |
| Crash recovery | ✅ Complete | — | R9.5 — calm `NiaErrorScreen` via `ErrorWidget.builder` |
| Housekeeping · test-count | ✅ Complete | — | R9.0 — one canonical count |
| Accessibility | ✅ Complete (labels, roles, headers, contrast) | 🔒 sub-48px tap targets + text-scale reflow on the 5 frozen screens (Q11) | [`R9_ACCESSIBILITY_AUDIT.md`](R9_ACCESSIBILITY_AUDIT.md) |
| Motion | ✅ Complete (+ golden-neutral Reduce-Motion fix) | 🔒 branded route transition (a product/motion call) | [`R9_MOTION_AUDIT.md`](R9_MOTION_AUDIT.md) |
| Typography | ✅ Audit complete; family/colour/weight pass | 🔒 reconcile ~11 inline sizes to the theme scale + `TextScaler` clamp — repaints frozen screens (Q11) | [`R9_TYPOGRAPHY_AUDIT.md`](R9_TYPOGRAPHY_AUDIT.md) |
| Performance (launch/low-end/battery/memory) | — | 🔒 needs the native/profile build (R2 / K1) — unmeasurable web-only | audited, recorded |

**No open in-authority R9 work remains.** Every residual item is genuinely gated — it needs the native
build (R2/K1) or a Founder-approved frozen-screen change (Q11). Those are tracked in `ROADMAP.md` and
`FOUNDER_REVIEW.md`; they do **not** hold R9 open.

*(Framing note: this means no in-authority work that **advances the product roadmap** remains. Optional
quality work — deeper coverage, observability, dependency upgrades, CI-on-runner — always exists and can
be picked up, but it does not move R2–R8 and should not block them. The critical path is Founder
decisions.)*

## State at sign-off

`nia verify` green · **92 tests / 21 files** · `flutter analyze` clean · no codegen drift · all five
goldens byte-identical. HEAD carries the Motion + Typography slice (`703e225`).

## What this unblocks

The frontend is **~90–95% complete** — the remainder is gated polish, not implementation. The bottleneck
has moved off frontend implementation entirely. The highest-return work is now **backend integration,
production data, and release** — R2–R8 — which run in parallel with R9's residual gates.

**The single highest-leverage unlock is OD-1 / backend un-pause** (`FOUNDER_REVIEW.md` Q2,
`DECISIONS.md`). It gates R3–R8 and the OD rulings expire **2026-07-13**.
