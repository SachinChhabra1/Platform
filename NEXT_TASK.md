# Next task

The single task the next session should pick up. Kept in sync with [`ROADMAP.md`](ROADMAP.md).
Start from [`START_HERE.md`](START_HERE.md).

## Status: R9 — Production Hardening ✅ SIGNED OFF (2026-07-04). Forward path = backend (R2–R8), all Founder-gated.

*Last verified: 2026-07-04 — `nia verify` green, **92 tests / 21 files**, analyze clean, no drift,
tree clean.*

**R9 is signed off** ([`R9_SIGNOFF.md`](R9_SIGNOFF.md)). Every category is ✅ in-authority-complete or
🔒 Founder-gated; no open in-authority R9 work remains. R9 does **not** stay open for perpetual polish —
it is now a **parallel Production Hardening stream** (Founder ruling, 2026-07-04), not the terminal gate
before backend. The program runs three streams: **Claude → backend (R2–R8)**, **Vercel → design
evolution**, **Founder → OD-1…OD-6**. See the stream table at the top of [`ROADMAP.md`](ROADMAP.md).

**Frontend engineering is ~90–95% complete.** The remainder is gated polish, not implementation. The
bottleneck has moved off frontend entirely; the highest return is now **backend integration, production
data, release**.

**Honest queue state: there is no unblocked in-authority engineering task.** Every forward item needs a
Founder decision or the native build. Per the loop, this is not failure — the queue is correctly
reporting a gate. **The single highest-leverage unlock is OD-1 / backend un-pause** (below); the OD
rulings expire **2026-07-13**.

**OD-1 decision brief is READY** — [`OD-1_WAGE_FLOW_BRIEF.md`](OD-1_WAGE_FLOW_BRIEF.md). The Wage-Flow
shortfall question (deduction priority when the wage lands short), three options, a recommendation
(Option B: dignity floor → rent → curry → remittance → savings → fee → advance; Nia's claims last), and a
one-line ruling shortcut. The Founder can rule OD-1 from that page in minutes; on ruling, write ADR-0012,
un-gate R3, and build the Wage Flow slice against the existing `services/*` scaffold.

**Founder-gated — these are what move the product to real production:**

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
