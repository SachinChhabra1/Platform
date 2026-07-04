# OD-6 · The Floor — Authoritative Enumeration Source — Decision Brief

**For:** Founder ruling. **Prepared:** 2026-07-04. **Expires:** 2026-07-13.
**A ruling becomes an ADR and un-gates the dignity gates (cross-cutting).** Book I (Art. I) → V.

## Decision to be made

"The Floor" — the non-negotiable dignity guarantees every Member gets (*"one Floor for everyone,"* Book
IV §6.7) — is referenced across the system: OD-1's dignity floor, off-boarding, the woman-Member floors,
the dignity gates. **Where does the authoritative list of the Floor live**, so it is one source,
versioned, and enforceable — rather than re-stated (and drifting) in six services?

## Why it matters

The Floor is the moral spine and, increasingly, the *technical* spine — several flows must check it
before acting (don't deduct a Member below the floor; don't off-board without the settlement floor).
If each service carries its own copy, the guarantees drift and "one Floor for everyone" quietly becomes
"one floor per service." This is why ruling it **early** removes ambiguity from OD-1, OD-4, and OD-5.

## Options

**A — Hard-coded per service.** *Pro:* nothing to build. *Con:* six copies, guaranteed drift, no single
audit point; the exact failure the Floor exists to prevent. Reject.

**B — One versioned server config, Founder-owned. ✅ RECOMMENDED.** A single source of truth — a
versioned `the_floor` configuration owned by the Founder, consumed by every service via a shared library
and surfaced to the app via API. Changes are **versioned and audited** (who changed the Floor, when,
why). *Pro:* enforces "one Floor for everyone" structurally; one place to read, one place to change, full
history. *Con:* needs a config service/library and a change-control convention.

**C — Encoded as database rows.** *Pro:* editable without a deploy. *Con:* muddles *policy* with
*data*, weakens the "Founder-owned, versioned, audited" guarantee, and makes the Floor as mutable as any
record — the opposite of non-negotiable. Reject.

## Recommendation

**Option B.** One versioned, Founder-owned `the_floor` config, consumed everywhere via a shared library,
surfaced read-only to the app, every change audited. Rule this **early in the sitting** so OD-1/-4/-5 can
reference a pinned Floor.

## Cost of delaying

Cross-cutting: leaves OD-1's "dignity floor", OD-4's money reconciliation, and every dignity gate
referencing an undefined source. Delaying OD-6 partially re-opens the ODs that depend on it — so it is
cheap to rule and expensive to defer.

## APIs · data model · services affected

- **Data model:** `the_floor` versioned config (dignity minimums, settlement floors, the woman-Member
  higher floors per FD-11); a change-audit record.
- **API:** read-only `GET /v1/floor` (versioned) for the app; internal shared-lib accessor for services.
- **Services:** a config/policy library used by **all** services; referenced by wage (OD-1), edge/sync
  (OD-4), savings (OD-5), membership (off-boarding floor).
- **Depends on:** nothing — it is a root. That is why it should be ruled first.

## To rule it in one line

> **"OD-6 is Option B: the Floor is one versioned, Founder-owned `the_floor` config, consumed by all
> services via a shared library and surfaced read-only to the app; every change audited."**
