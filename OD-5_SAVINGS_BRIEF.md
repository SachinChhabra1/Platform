# OD-5 · Savings Withdrawal Mechanics (Settlement Time + Interest Treatment) — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Expires:** 2026-07-13.
**A ruling becomes an ADR and un-gates the Savings Flow slice.** Book IV §4.4.

## Decision to be made

When a Member withdraws from savings: **(a) how fast do they get their money** (availability vs.
settlement), and **(b) who earns the interest** the savings accrued while held?

## Why it matters

Savings is the Store flywheel's payoff — *"Am I actually keeping more?"* → Satisfaction. Two things
decide whether savings feels like *the Member's money working for them* or *Nia holding their money*:
how quickly they can get it back, and whether the yield is theirs. Both are trust signals a low-income
Member reads instantly.

## Options

**A — Instant to Wallet, interest to Nia (float).** *Pro:* funds Nia's economics; simplest yield story.
*Con:* Nia earning the interest on the Member's savings is exactly the "institution keeps the upside"
pattern the product exists to invert. Off-brand. Reject.

**B — Instant availability, T+n settlement, interest to the Member. ✅ RECOMMENDED.** On withdrawal the
amount is **immediately available in the Wallet** (the Member *sees* and can use it now); actual rail
**settlement is T+n** (disclosed). **Interest accrues to the Member**, net of a single disclosed fee if
any. *Pro:* "the Member wins" — their money, their yield, available on demand; matches the Satisfaction
register. *Con:* Nia carries brief settlement float; needs an accrual model.

**C — Locked term with early-withdrawal penalty.** *Pro:* higher yield, encourages discipline. *Con:*
penalising a migrant worker for needing their own money in an emergency violates the dignity floor. Only
valid if savings is *explicitly* sold as a term product — not the default.

## Recommendation

**Option B.** Instant Wallet availability, T+n true settlement, interest to the Member net of any
disclosed fee. No withdrawal penalty on the default savings product.

## Cost of delaying

Blocks the Savings Flow slice and weakens the Store pillar's payoff in any demo (savings can be *shown*
but not *moved*). Also leaves OD-1's savings deduction step without a matching withdrawal path.

## APIs · data model · services affected

- **Data model:** `savings_account` (principal, `accrued_interest`, lock state); `withdrawal` record
  (`requested → available → settled`); interest accrual job.
- **API:** `openapi.savings.yaml` (balance, deposit, withdraw, status); writes the `savings` ledger
  category in `openapi.wallet.yaml`.
- **Services:** a savings service (dir not yet scaffolded); interacts with RafiQi (OD-3, if RafiQi moves
  savings) and the Wallet ledger.
- **Depends on:** OD-1 (savings is a wage deduction) and OD-3 (RafiQi-initiated savings moves).

## To rule it in one line

> **"OD-5 is Option B: withdrawal is instantly available in the Wallet, settles T+n; interest accrues to
> the Member net of any disclosed fee; no early-withdrawal penalty on the default product."**
