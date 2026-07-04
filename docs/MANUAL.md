# The NiaBook operating manual (00–17)

The numbered operating manual, **charter first**. This is an *index over the real repo* — each
book points to its canonical home. We do not keep two copies of anything; the file linked
below is the source of truth. Start at [`../START_HERE.md`](../START_HERE.md).

> Provenance: a numbered manual skeleton was drafted in a separate empty workspace (it
> described a generic finance app and assumed no code existed). We adopted its **structure**
> only and grounded every book in this repository, which contains the real NiaBook app. The
> generic product/status content was discarded.

| # | Book | Canonical file(s) | Status |
|---|------|-------------------|--------|
| 00 | Engineering Charter | [`CHARTER.md`](CHARTER.md) + the Engineering Director charter in [`AUTONOMOUS-LOOP.md`](AUTONOMOUS-LOOP.md) | ✅ real |
| 01 | Nia OS | [`../README.md`](../README.md) · [`nia-os/`](nia-os) (canonical books held by Founder) · [`../PRODUCT_ARCHITECTURE.md`](../PRODUCT_ARCHITECTURE.md) | ✅ real |
| 02 | Product Bible | [`02_PRODUCT_BIBLE.md`](02_PRODUCT_BIBLE.md) — screen-by-screen | ✅ real (new) |
| 03 | Engineering Constitution | [`AUTONOMOUS-LOOP.md`](AUTONOMOUS-LOOP.md) + [`methodology.md`](methodology.md) | ✅ real |
| 04 | Architecture | [`adr/`](adr) (11 ADRs) + [`engineering-stack.md`](engineering-stack.md) | ✅ real |
| 05 | Design System | [`../DESIGN_SYSTEM_LOCK.md`](../DESIGN_SYSTEM_LOCK.md) | ✅ real |
| 06 | Roadmap | [`../ROADMAP.md`](../ROADMAP.md) | ✅ real |
| 07 | Testing | [`07_TESTING.md`](07_TESTING.md) | ✅ real (new) |
| 08 | Release Guide | — | 🕳 gap — how a build ships (currently: `flutter build web` + demo pack). Fill when a release pipeline exists. |
| 09 | Operations | — | 🕳 gap — runtime/observability. Backend paused; fill when services run. |
| 10 | Changelog | [`../CHANGELOG.md`](../CHANGELOG.md) | ✅ real |
| 11 | Decisions | [`../DECISIONS.md`](../DECISIONS.md) + [`adr/`](adr) | ✅ real |
| 12 | Project Status | [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | ✅ real |
| 13 | Next Task | [`../NEXT_TASK.md`](../NEXT_TASK.md) | ✅ real |
| 14 | Session | [`../SESSION.md`](../SESSION.md) | ✅ real |
| 15 | Engineering Journal | [`../SESSION.md`](../SESSION.md) (serves as the journal) | ✅ real |
| 16 | Engineering Scorecard | the Scorecard section in [`AUTONOMOUS-LOOP.md`](AUTONOMOUS-LOOP.md) | ✅ real |
| 17 | Risk Register | [`../KNOWN_BUGS.md`](../KNOWN_BUGS.md) (limitations) + [`../DECISIONS.md`](../DECISIONS.md) (OD-1…OD-6 open decisions) | ✅ real |

## Reading order

Charter (00) → Nia OS (01) → Product Bible (02) → Constitution (03) → the rest as needed.
`START_HERE.md` encodes the practical orientation sequence for a fresh session.

## Filling the gaps

08 (Release Guide) and 09 (Operations) are intentionally empty — writing them now would
document a pipeline and a runtime that don't exist yet. They are grounded-only: create them
when the thing they describe exists. Do not pad governance; the leverage is in the product,
not more process (see the budget rule in the Constitution).
