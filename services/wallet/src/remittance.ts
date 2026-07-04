/// Remittance completion — the state machine for "did the money reach the family"
/// (R4; ruling: ADR-0013 / OD-2, locked in /ENGINEERING_LOCK.md).
///
/// The one rule that matters: **"sent" is NOT "confirmed."** Money leaving on the
/// rail (`in_transit`) must never read as success. A remittance is CONFIRMED only
/// when the funds are **available to the named recipient** (`confirmed_available`
/// — "Reached home"). If it stalls, it auto-escalates to the Operator after a
/// 24h SLA. Family acknowledgement is an OPTIONAL extra signal — never the
/// confirmation gate.
///
/// Every transition appends to an audit `history` and the whole record is keyed
/// by remittance id (and carries the funding `settlementId`), so the state is
/// auditable by settlement/remittance id. Amounts are integer paise (`money.ts`).
///
/// INDEPENDENCE: this money path has NO dependency on arrears recovery (OD-7,
/// unruled). It imports nothing from `arrears.ts`; a remittance initiates,
/// confirms, and settles entirely on its own.
///
/// NOTE (bounded context): co-located in the wallet money domain (the offline dev
/// sandbox cannot add a new pnpm workspace member). Extract to `services/remittance`
/// when online.

import type { Money } from './money.js';

/// The lifecycle. `escalated` is the branch taken when the SLA breaches before
/// confirmation; it is not "confirmed".
export type RemittanceState =
  | 'initiated'
  | 'in_transit' // "sent" — money left on the rail. NOT confirmed.
  | 'confirmed_available' // funds available to the recipient — "Reached home".
  | 'settled' // rail fully settled after confirmation.
  | 'escalated'; // SLA breached while unconfirmed → Operator owns it.

export type RemittanceEventType =
  | 'initiated'
  | 'sent'
  | 'recipient_available'
  | 'family_acknowledged'
  | 'settled'
  | 'escalated';

export interface RemittanceEvent {
  readonly type: RemittanceEventType;
  readonly at: string; // ISO timestamp (server time)
}

export interface Remittance {
  readonly id: string;
  readonly membershipId: string;
  /** The wage settlement that funded this remittance, if any (audit linkage). */
  readonly settlementId?: string | undefined;
  /** Opaque reference to the named recipient (the family member). */
  readonly recipientId: string;
  readonly amount: Money;
  readonly state: RemittanceState;
  readonly initiatedAt: string;
  /** The SLA deadline: `initiatedAt` + 24h. Past this, an unconfirmed remittance escalates. */
  readonly escalateAfter: string;
  /** Optional extra signal — the family said they received it. NEVER the gate. */
  readonly familyAcknowledged: boolean;
  /** Append-only audit trail, oldest first. */
  readonly history: readonly RemittanceEvent[];
}

const SLA_MS = 24 * 60 * 60 * 1000;

/// True only when the funds are confirmed available to the recipient (or fully
/// settled thereafter). Crucially, an `in_transit` ("sent") remittance is NOT
/// confirmed — that is the whole point of ADR-0013.
export function isConfirmed(r: Remittance): boolean {
  return r.state === 'confirmed_available' || r.state === 'settled';
}

function advance(r: Remittance, state: RemittanceState, type: RemittanceEventType, at: string): Remittance {
  return { ...r, state, history: [...r.history, { type, at }] };
}

export interface InitiateInput {
  readonly id: string;
  readonly membershipId: string;
  readonly recipientId: string;
  readonly amount: Money;
  readonly now: Date;
  readonly settlementId?: string;
}

/// Begin a remittance. It is `initiated`, not sent and certainly not confirmed.
export function initiateRemittance(input: InitiateInput): Remittance {
  const initiatedAt = input.now.toISOString();
  const escalateAfter = new Date(input.now.getTime() + SLA_MS).toISOString();
  return {
    id: input.id,
    membershipId: input.membershipId,
    settlementId: input.settlementId,
    recipientId: input.recipientId,
    amount: input.amount,
    state: 'initiated',
    initiatedAt,
    escalateAfter,
    familyAcknowledged: false,
    history: [{ type: 'initiated', at: initiatedAt }],
  };
}

/// The money left on the rail — "sent". This is explicitly NOT confirmation.
export function markSent(r: Remittance, now: Date): Remittance {
  if (r.state !== 'initiated') {
    throw new Error(`cannot mark sent from state '${r.state}'`);
  }
  return advance(r, 'in_transit', 'sent', now.toISOString());
}

/// The funds are available to the named recipient — the ONLY path to confirmation
/// ("Reached home"). Valid from `initiated` (rail skipped the in-transit signal)
/// or `in_transit`.
export function markRecipientAvailable(r: Remittance, now: Date): Remittance {
  if (r.state !== 'initiated' && r.state !== 'in_transit') {
    throw new Error(`cannot confirm recipient-available from state '${r.state}'`);
  }
  return advance(r, 'confirmed_available', 'recipient_available', now.toISOString());
}

/// Record that the family acknowledged receipt. OPTIONAL: it sets a flag and adds
/// an audit event but does NOT change state or confirm anything. Allowed any time
/// before final settlement.
export function acknowledgeByFamily(r: Remittance, now: Date): Remittance {
  if (r.state === 'settled') {
    throw new Error('cannot acknowledge a settled remittance');
  }
  return {
    ...r,
    familyAcknowledged: true,
    history: [...r.history, { type: 'family_acknowledged', at: now.toISOString() }],
  };
}

/// Final rail settlement — only after the recipient-available confirmation.
export function markSettled(r: Remittance, now: Date): Remittance {
  if (r.state !== 'confirmed_available') {
    throw new Error(`cannot settle a remittance that is not confirmed_available (state '${r.state}')`);
  }
  return advance(r, 'settled', 'settled', now.toISOString());
}

/// SLA check (pure). If the remittance is still unconfirmed at/after its 24h
/// deadline, it escalates to the Operator. A confirmed/settled remittance never
/// escalates; an already-escalated one is unchanged.
export function checkSla(r: Remittance, now: Date): Remittance {
  const unconfirmed = r.state === 'initiated' || r.state === 'in_transit';
  if (unconfirmed && now.getTime() >= Date.parse(r.escalateAfter)) {
    return advance(r, 'escalated', 'escalated', now.toISOString());
  }
  return r;
}
