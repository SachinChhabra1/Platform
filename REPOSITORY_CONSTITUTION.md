# Repository Constitution

One page. It answers one question: **what is the canonical source of truth, and when two
documents disagree, which one wins?** Read it before trusting any other document.

## There are two axes — keep them separate

**Intent — what NiaBook *should* be.** Highest authority wins; code that disagrees is a bug to fix.

```
Nia OS (the books — founder product canon)
  ↓
Founder decisions        DECISIONS.md · docs/adr/ · active freezes (e.g. the board-demo lock)
  ↓
Product intent           docs/03_PRODUCT_BIBLE.md · PRODUCT_ARCHITECTURE.md
  ↓
Design spec              DESIGN_SYSTEM_LOCK.md  (the five goldens are the visual spec)
  ↓
Architecture             docs/adr/ · docs/engineering-stack.md
  ↓
Engineering governance   docs/CHARTER.md · docs/AUTONOMOUS-LOOP.md
```

**Reality — what NiaBook *currently is*.** The repository is the memory; docs that disagree with
it are stale and must be updated to match.

```
Source code + tests + goldens   apps/  (what exists and how it behaves, today)
  ↓  describes, must match the above
State docs                      docs/PROJECT_STATUS.md · ROADMAP.md · NEXT_TASK.md · SESSION.md
```

## The tie-break rules

1. **On intent, the higher line wins.** If code contradicts Nia OS, the Product Bible, or the
   Design Lock, **the code is wrong** — change the code (or, if the doc is truly outdated, get a
   Founder decision and update the doc). Never silently let code redefine intent.
2. **On reality, the repository wins.** If a state doc says something the code/tests/goldens
   contradict, the doc is stale — **update the doc to match the repo.**
3. **Screens beat prose.** Where the Design Lock's words and the approved goldens disagree, the
   goldens win.
4. **Founder decisions are absolute** within their scope. A freeze (board-demo lock) or a ruling
   (an ADR, an OD resolution) overrides engineering judgement until the Founder changes it.
5. **Never restate — reference.** One fact lives in one file. Other docs link to it. An ADR is
   never copied into another document.
6. **When unsure, don't guess.** Record the question in `FOUNDER_REVIEW.md` and keep working
   elsewhere; do not invent intent.

## Where each thing lives (canonical homes)

| Domain | Canonical source |
|---|---|
| Product intent | `docs/03_PRODUCT_BIBLE.md`, `PRODUCT_ARCHITECTURE.md` (Nia OS books held by Founder) |
| Engineering governance | `docs/CHARTER.md` (00), `docs/AUTONOMOUS-LOOP.md` (constitution + loop) |
| Architecture | `docs/adr/`, `docs/engineering-stack.md` |
| Design | `DESIGN_SYSTEM_LOCK.md` + `apps/member/test/goldens/` |
| Current state | `docs/PROJECT_STATUS.md`, `ROADMAP.md`, `NEXT_TASK.md`, `SESSION.md` |
| Open Founder questions | `FOUNDER_REVIEW.md` |
| Implementation | `apps/` (source code, tests, goldens) |

The numbered manual (`docs/00–17`) *organises and exposes* these; it never replaces them.
