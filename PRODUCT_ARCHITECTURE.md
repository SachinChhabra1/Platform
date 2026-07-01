# Nia — Product Architecture

The canonical product reference. Not a technical document. This is what Nia *is*,
so the product does not drift as the team grows. One page. Read it before you design
or build anything.

---

## The four economic promises

Nia helps a migrant worker do four things. Every screen serves one of them.

| Pillar | Promise | Means |
|---|---|---|
| **Work** | Earn more | A better, certified, higher-paying job. |
| **Living** | Spend less | Lower, predictable living costs. |
| **Store** | Keep more | Member prices and smart swaps. |
| **Family** | Send more home | More reaches the people it was earned for. |

Earn more · spend less · keep more · send more home. That is the whole company.

## The role of NiaBook

**NiaBook is the home ledger. It proves the promises became true.** It is the first
screen and the artefact of the product — not a wallet, statement, passbook, or
tracker. Left column: *what became true* (money gained this month, closed). Right
column: *more you can keep* (still waiting). **Every month, one line moves from ○
(waiting) to ✓ (true).** NiaBook records reality; it never judges it.

## The role of RafiQi

**RafiQi is the finder of opportunity.** It surfaces the "more you can keep" — a
better job, a cheaper path, a voucher, a way to meet an upcoming goal — quietly,
across pillars (Work pays for Family; Store savings fund electricity). **RafiQi finds;
the Member decides.** RafiQi is named, never the hero.

## The semantic scaffold (every pillar, same structure)

No pillar invents its own structure. Each answers the same questions in the same
order. Enforced in code by `PillarScaffold` (`features/pillars/pillar_kit.dart`):

```
Identity → Economic promise → Reality → Opportunity → Supporting → Improves NiaBook
```

| Pillar | Reality | Opportunity | Supporting | Contribution |
|---|---|---|---|---|
| Work | Current job, pay, attendance | Higher-paying certified role | Better jobs, skill progress | Higher wages · voucher · savings · home |
| Living | Studio, this month's cost | A cheaper path | Room, meals, community, safety, services | Lower, predictable cost |
| Store | Savings today, month, year | Voucher, smart swaps | Essentials at member prices | Higher savings |
| Family | What reached home | Ways to meet an upcoming goal | Family status, benefits, protection | More reached home |

The labels change; the scaffold never does. When a Member learns one pillar, they
understand the others.

## The product laws

1. **Consistency is part of the product.** No pillar invents its own structure.
2. **The approved screens are the specification.** Do not redesign, reinterpret,
   improve, or simplify. If words and screens disagree, the screens win.
3. **Money first, explanation second.** No judgement language. No banking language.
   No "wallet". No "was leaving home worth it".
4. **Every service must improve this month's NiaBook or make next month's better.**
   The build test for any feature: *will this improve next month's NiaBook?* If not,
   don't build it. (Recording → compounding.)
5. **RafiQi finds; the Member decides.** SOS reaches help through an abstract route
   (Nia Emergency), never permanently a single destination.

The one line to remember: **Nia is not building features. It is building a monthly
record of progress for migrant workers — a record that compounds.**
