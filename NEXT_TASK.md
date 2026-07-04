# Next task

The single task the next session should pick up. Kept in sync with [`ROADMAP.md`](ROADMAP.md).
Start from [`START_HERE.md`](START_HERE.md).

## Status: Production Readiness Lead mode — R9 in progress (in-authority work available)

*Last verified: 2026-07-04 — `nia verify` green, **82 tests / 18 files**, analyze clean, no drift,
tree clean.*

**Founder ruling (2026-07-04):** when the feature roadmap is gated, become **Production Readiness
Lead** and work **R9 — Production Readiness** ([`ROADMAP.md`](ROADMAP.md)) — the final 10% that makes
the app trustworthy, not new features. R1 is complete; the board freeze is lifted.

**Done this session:** R9.1 — live-surface error/offline states (complete). A calm error + Retry
(`NiaAsyncView`) now replaces the infinite spinner on API failure across the money surfaces (home,
wallet, my_family) and `profile_page`'s standing; `membership_header` degrades gracefully by design.
+5 tests; goldens byte-identical.

**Next in-authority (pick up here):** R9.0 consolidate the restated test count (kills the per-slice
doc churn) · R9.2 empty-state review · R9.4 accessibility audit (TalkBack/VoiceOver, tap targets,
contrast) · R9.5 crash-recovery error boundary. See R9 in `ROADMAP.md`.

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
