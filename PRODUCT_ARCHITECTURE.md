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
| **Family** | Take better care of home | The people you left home for are cared for — money is one way, not the only one. |

Earn more · spend less · keep more · care for home. That is the whole company.
(The nav still reads **Family**; the promise is care. Family is the emotional
centre — not a remittance, payments, or insurance screen. Every block answers one
question: *how are the people I left home for?*)

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
| Living | Studio, this month's cost | A cheaper path | Nest, meals, community, safety, services | Lower, predictable cost |
| Store | Savings today, month, year | Voucher, smart swaps | Essentials at member prices | Higher savings |
| Family | How the people at home are | Ways to meet an upcoming goal (cross-pillar) | Family status, protection | The people at home are cared for |

The labels change; the scaffold never does. When a Member learns one pillar, they
understand the others.

## Vocabulary (canonical — never substitute)

The words are part of the product. Get them right everywhere, member-facing and in code.

**The place hierarchy:** a **Nest** is a Member's own space. Nests make a **Coach**;
Coaches make a **Studio**; Studios make a **Theatre**.

```
Nest  →  Coach  →  Studio  →  Theatre
```

Also: **Member** (never tenant) · **Nest** (never room or bed) · **Membership fee**
(never rent) · **Studio** (never PG or hostel) · **NiaBook** (never wallet).

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
6. **The emotional contract — every screen leaves the Member more than informed.**
   Not educated. Not merely informed — moved. This is not UX; it is the promise of
   the company. **Every pillar ends on a different emotion, and that is the point:**

   | Screen | Emotion | The Member feels |
   |---|---|---|
   | Work | **Hope** | "I can earn more." |
   | Living | **Relief** | "My life here is easier." |
   | Store | **Satisfaction** | "I kept more." |
   | Family | **Purpose** | "The people I left home for are doing better." |
   | NiaBook | **Truth** | "Here is what became real." |

   Achieve those five emotions and you have not built five screens — you have built
   one operating system with five emotional states. Family is the one that closes
   emotionally, not financially; protect that. A screen that leaves the Member
   merely *informed* has failed this law, even if it matches the spec.

## The intake test for every future feature

Before anything is built, it must answer two questions. If it cannot, it does not
belong in Nia — no exceptions, no special cases, no one-offs.

1. **Which of the four promises does this strengthen?** (Earn more · spend less ·
   keep more · send more home.)
2. **How will NiaBook prove it?**

**Everything improves NiaBook. This is sacred.** The standing temptation as the team
grows is to add exceptions that quietly turn one operating system back into five apps.
These two questions are how you refuse.

The one line to remember: **Nia is not building features. It is building a monthly
record of progress for migrant workers — a record that compounds.**
