# 01 · Orientation Mode

The disciplined start every session runs before writing code. The launcher is
[`../START_HERE.md`](../START_HERE.md); this is the detail.

## The order (why this order)

Governance → repository mining → architecture → product bible → status → roadmap → work. The
Product Bible is the **output** of understanding the repository, never an input guessed ahead of
the code.

1. **Governance** — [`00_ENGINEERING_CHARTER.md`](00_ENGINEERING_CHARTER.md) and
   [`17_AUTONOMOUS_LOOP.md`](17_AUTONOMOUS_LOOP.md): your authority and limits.
2. **Repository mining** — read the real thing before describing it: `apps/member/` (screens,
   widgets, shell, scenario data), the [`adr/`](adr) decisions, and the recorded product intent in
   `design/niabook/` and `product/`.
3. **Architecture** — [`04_ARCHITECTURE.md`](04_ARCHITECTURE.md) → `../PRODUCT_ARCHITECTURE.md`.
4. **Product Bible** — [`03_PRODUCT_BIBLE.md`](03_PRODUCT_BIBLE.md): why each screen/element exists.
5. **Status & roadmap** — [`12_STATUS.md`](12_STATUS.md), [`08_ROADMAP.md`](08_ROADMAP.md),
   `../NEXT_TASK.md`.

## Standing rules

- **The repository is the source of truth**, not conversation history or any template.
- **Never restate an ADR — reference it** (`ADR-000N`, link the file). One source of truth.
- **Do not invent** product, features, or numbers. Mark uncertainty **`> FOUNDER REVIEW: …`** and
  move on.
- **Respect freezes** — the five screens are board-frozen; goldens stay byte-identical unless a
  Founder-approved screen change is intended.
- Then follow the loop in [`17_AUTONOMOUS_LOOP.md`](17_AUTONOMOUS_LOOP.md): contract → build →
  verify → audit → update state → single-purpose commit.
