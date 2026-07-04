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
- **Do not invent** product, features, or numbers. Record the open question in
  [`../FOUNDER_REVIEW.md`](../FOUNDER_REVIEW.md) (and mark it inline `> FOUNDER REVIEW: …`), then
  keep working elsewhere. Never interrupt the Founder for it.
- **Read the tie-breaker** [`../REPOSITORY_CONSTITUTION.md`](../REPOSITORY_CONSTITUTION.md): when
  two documents disagree, it defines which wins.
- **Respect freezes** — the five screens are board-frozen; goldens stay byte-identical unless a
  Founder-approved screen change is intended.
- Then follow the loop in [`17_AUTONOMOUS_LOOP.md`](17_AUTONOMOUS_LOOP.md): contract → build →
  verify → audit → update state → single-purpose commit.

## Orientation exit checklist (measurable)

Orientation is **not complete** until you can answer all of these from the repository. If you
cannot, keep reading — you are not ready to write code.

1. What is Nia's mission, and why does NiaBook exist? (`PRODUCT_ARCHITECTURE.md`, `03_PRODUCT_BIBLE.md`)
2. What is the member's primary goal on each screen, and which emotion must it leave? (`03_PRODUCT_BIBLE.md`)
3. How does navigation work today? (`IndexedStack` shell, modal SOS — `04_ARCHITECTURE.md`)
4. Which ADR controls the clients/navigation stack? (ADR-0002) Which controls design? (ADR-0003) — `07_DECISIONS.md`
5. What is currently frozen, and what proves it? (the board freeze; the five goldens — `16_RISK_REGISTER.md`)
6. What Founder decisions remain open? (`../DECISIONS.md` OD-1…OD-6; `../FOUNDER_REVIEW.md`)
7. Where is the roadmap, and what is the next **unlocked** task? (`08_ROADMAP.md`, `../NEXT_TASK.md`)
8. What production risks/limitations exist? (`16_RISK_REGISTER.md` → `../KNOWN_BUGS.md`)
9. How is success measured this session? (`15_SCORECARD.md`: verify green, analyze clean, tests green, goldens frozen, debt flat-or-down)
10. When two docs disagree, which wins? (`../REPOSITORY_CONSTITUTION.md`)
