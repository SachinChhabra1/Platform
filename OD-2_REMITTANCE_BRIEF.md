# OD-2 · Remittance "Destination-Confirmed" Mechanism + Escalation SLA — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Expires:** 2026-07-13.
**A ruling becomes an ADR and un-gates the Remittance-completion slice.** Books I §4.9, IV §4.3.

## Decision to be made

When a Member sends money home, **what counts as "the money reached the family"**, and **how long may
it stall before Nia escalates**? Two linked parameters: the *confirmation definition* and the
*escalation SLA*.

## Why it matters

Remittance is the emotional core of the product — *"every rupee you earn, save, and send home, visible
to you."* A false "sent" (money left the Member but never reached the family) is the single most
trust-destroying event Nia can produce. The confirmation bar decides whether NiaBook can honestly show
"Reached home."

## Options

**A — Rail-confirmed.** "Confirmed" = the payment rail reports settled. *Pro:* trivial to implement,
fast. *Con:* "settled to an account" ≠ "family received it" — wrong account, failed cash pickup, or a
frozen beneficiary all read as success. Breaks the promise on the exact edge that matters.

**B — Recipient-available confirmed + 24h SLA. ✅ RECOMMENDED.** "Confirmed" = funds are *available to
the named recipient* (credited / ready for pickup), shown to the Member as **"Reached home."** If not
confirmed within **24h**, the record **auto-escalates to the Operator**, who personally chases the rail
and informs the Member (no silent stall). *Pro:* matches "the Member wins" and the emotional weight;
the Operator backstop is already the product's human-escalation pattern. *Con:* needs rail callbacks +
an SLA timer.

**C — Recipient-acknowledged.** Require the family to actively confirm receipt. *Pro:* highest certainty.
*Con:* many families have no phone/app; blocking on their action strands money in limbo. Keep as an
*optional extra* signal, never the gate.

## Recommendation

**Option B.** Confirmation = recipient-available; 24h SLA then automatic Operator escalation. Treat any
family acknowledgement (C) as a bonus signal that upgrades confidence, not a requirement.

## Cost of delaying

Blocks the Remittance slice entirely — and remittance is the promise most visible to a Member. Every
week unruled is a week the highest-trust flow can't be built or demoed to investors.

## APIs · data model · services affected

- **Data model:** `remittance` record with states `initiated → in_transit → confirmed_available →
  (escalated) → settled`; an SLA-timer field (`escalate_after`); recipient identity.
- **API:** new `openapi.remittance.yaml` (send, status, webhook for rail confirmation); NiaBook reads
  the `confirmed_available` state as "Reached home."
- **Services:** a remittance service (dir not yet scaffolded) + `services/edge` for rail webhooks;
  writes the `remittance` category already defined in `openapi.wallet.yaml`.
- **Depends on:** the Operator-escalation surface (exists as the SOS/Operator pattern).

## To rule it in one line

> **"OD-2 is Option B: confirmed = recipient-available ('Reached home'); 24h SLA then auto-escalate to
> the Operator; family acknowledgement is an optional extra signal, not the gate."**
