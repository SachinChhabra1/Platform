import { describe, expect, it } from 'vitest';
import { rupees } from './money.js';
import {
  acknowledgeByFamily,
  checkSla,
  initiateRemittance,
  isConfirmed,
  markRecipientAvailable,
  markSent,
  markSettled,
  type Remittance,
} from './remittance.js';
import {
  escalateIfStalled,
  InMemoryOperatorEscalations,
  InMemoryRemittanceStore,
} from './remittance_ledger.js';

const T0 = new Date('2026-07-04T09:00:00.000Z');
const plus = (base: Date, ms: number): Date => new Date(base.getTime() + ms);
const HOURS = (n: number): number => n * 60 * 60 * 1000;

function start(over: Partial<Parameters<typeof initiateRemittance>[0]> = {}): Remittance {
  return initiateRemittance({
    id: 'rem-1',
    membershipId: 'm-001',
    recipientId: 'fam-anita',
    amount: rupees(5000),
    now: T0,
    settlementId: 's-42',
    ...over,
  });
}

describe('Remittance — "sent" is NOT "confirmed" (ADR-0013, proof 1)', () => {
  it('a sent remittance is in_transit and not confirmed', () => {
    const r = markSent(start(), plus(T0, HOURS(1)));
    expect(r.state).toBe('in_transit');
    expect(isConfirmed(r)).toBe(false);
  });

  it('an in_transit remittance cannot be settled — sent does not unlock settlement', () => {
    const sent = markSent(start(), plus(T0, HOURS(1)));
    expect(() => markSettled(sent, plus(T0, HOURS(2)))).toThrow();
  });
});

describe('Remittance — confirmed only means recipient-available (proof 2)', () => {
  it('only markRecipientAvailable confirms ("Reached home")', () => {
    const r = markRecipientAvailable(markSent(start(), plus(T0, HOURS(1))), plus(T0, HOURS(2)));
    expect(r.state).toBe('confirmed_available');
    expect(isConfirmed(r)).toBe(true);
    expect(r.history.map((e) => e.type)).toEqual(['initiated', 'sent', 'recipient_available']);
  });

  it('confirmation can skip the in_transit signal (available straight from initiated)', () => {
    const r = markRecipientAvailable(start(), plus(T0, HOURS(1)));
    expect(r.state).toBe('confirmed_available');
    expect(isConfirmed(r)).toBe(true);
  });
});

describe('Remittance — family acknowledgement is OPTIONAL, not the gate (proof 3)', () => {
  it('acknowledgement alone does NOT confirm', () => {
    const acked = acknowledgeByFamily(markSent(start(), plus(T0, HOURS(1))), plus(T0, HOURS(2)));
    expect(acked.familyAcknowledged).toBe(true);
    expect(acked.state).toBe('in_transit'); // still not confirmed
    expect(isConfirmed(acked)).toBe(false);
  });

  it('confirmation happens WITHOUT any acknowledgement (ack is not required)', () => {
    const r = markRecipientAvailable(markSent(start(), plus(T0, HOURS(1))), plus(T0, HOURS(2)));
    expect(r.familyAcknowledged).toBe(false);
    expect(isConfirmed(r)).toBe(true); // confirmed with no family ack at all
  });
});

describe('Remittance — 24h stall escalates to the Operator (proof 4)', () => {
  it('an unconfirmed remittance past 24h escalates (pure checkSla)', () => {
    const sent = markSent(start(), plus(T0, HOURS(1)));
    const stalled = checkSla(sent, plus(T0, HOURS(25)));
    expect(stalled.state).toBe('escalated');
    expect(stalled.history.at(-1)?.type).toBe('escalated');
  });

  it('does NOT escalate before 24h, nor once confirmed', () => {
    const sent = markSent(start(), plus(T0, HOURS(1)));
    expect(checkSla(sent, plus(T0, HOURS(23))).state).toBe('in_transit'); // before deadline
    const confirmed = markRecipientAvailable(sent, plus(T0, HOURS(2)));
    expect(checkSla(confirmed, plus(T0, HOURS(48))).state).toBe('confirmed_available'); // confirmed never escalates
  });

  it('escalation raises an Operator hand-off keyed by remittance + settlement id', async () => {
    const operator = new InMemoryOperatorEscalations();
    const store = new InMemoryRemittanceStore();
    const sent = markSent(start(), plus(T0, HOURS(1)));
    const escalated = await escalateIfStalled(sent, plus(T0, HOURS(25)), { operator, store });

    expect(escalated.state).toBe('escalated');
    const raised = await operator.listForRemittance('rem-1');
    expect(raised).toHaveLength(1);
    expect(raised[0]).toMatchObject({
      remittanceId: 'rem-1',
      settlementId: 's-42',
      reason: 'sla_breached_unconfirmed',
    });
    // Persisted and auditable by id.
    expect((await store.get('rem-1'))?.state).toBe('escalated');
  });

  it('escalation is idempotent — a second sweep raises nothing new', async () => {
    const operator = new InMemoryOperatorEscalations();
    const sent = markSent(start(), plus(T0, HOURS(1)));
    const once = await escalateIfStalled(sent, plus(T0, HOURS(25)), { operator });
    await escalateIfStalled(once, plus(T0, HOURS(26)), { operator });
    expect(await operator.listForRemittance('rem-1')).toHaveLength(1);
  });
});

describe('Remittance — auditable lifecycle, independent of OD-7 (proof 5)', () => {
  it('a full lifecycle settles with NO arrears/recovery concept involved', async () => {
    // The happy path uses only the remittance module — no arrears, no OD-7.
    const store = new InMemoryRemittanceStore();
    let r = start();
    r = markSent(r, plus(T0, HOURS(1)));
    r = markRecipientAvailable(r, plus(T0, HOURS(2)));
    r = markSettled(r, plus(T0, HOURS(3)));
    await store.save(r);

    expect(r.state).toBe('settled');
    expect(isConfirmed(r)).toBe(true);
    // The audit trail is complete and keyed by remittance + settlement id.
    const saved = await store.get('rem-1');
    expect(saved?.settlementId).toBe('s-42');
    expect(saved?.history.map((e) => e.type)).toEqual([
      'initiated',
      'sent',
      'recipient_available',
      'settled',
    ]);
  });

  it('history is append-only across every transition (auditable by id)', () => {
    let r = start();
    const counts: number[] = [r.history.length];
    r = markSent(r, plus(T0, HOURS(1)));
    counts.push(r.history.length);
    r = acknowledgeByFamily(r, plus(T0, HOURS(1) + 60000));
    counts.push(r.history.length);
    r = markRecipientAvailable(r, plus(T0, HOURS(2)));
    counts.push(r.history.length);
    expect(counts).toEqual([1, 2, 3, 4]); // strictly growing, nothing rewritten
    expect(r.id).toBe('rem-1');
  });
});
