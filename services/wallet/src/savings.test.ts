import { describe, expect, it } from 'vitest';
import {
  accrueInterest,
  balancePaise,
  deposit,
  NoInterestAccrualPolicy,
  openAccount,
  requestWithdrawal,
  settleWithdrawal,
  type InterestAccrualPolicy,
  type SavingsAccount,
} from './savings.js';

const MEMBER = 'm-001';
const OPENED = new Date('2026-06-01T00:00:00.000Z');
const DAYS = (n: number): number => n * 24 * 60 * 60 * 1000;

/** A test-only policy: fixed gross interest and fee per accrual call. The real
 * rate/formula is Founder-owned config behind this seam; tests only need to prove
 * the domain nets the fee correctly and hands the yield to the Member. */
class StubPolicy implements InterestAccrualPolicy {
  constructor(
    private readonly gross: number,
    private readonly fee: number,
  ) {}
  accrue(): { readonly grossPaise: number; readonly feePaise: number } {
    return { grossPaise: this.gross, feePaise: this.fee };
  }
}

function account(overrides: Partial<SavingsAccount> = {}): SavingsAccount {
  return { ...openAccount({ id: 'sav-1', membershipId: MEMBER, now: OPENED, openingPrincipalPaise: 100_000 }), ...overrides };
}

describe('Savings account — open, deposit, balance', () => {
  it('opens an unlocked account with the opening principal and no interest yet', () => {
    const a = openAccount({ id: 'sav-1', membershipId: MEMBER, now: OPENED, openingPrincipalPaise: 100_000 });
    expect(a).toMatchObject({ principalPaise: 100_000, netInterestPaise: 0, feePaise: 0, locked: false });
    expect(a.openedAt).toBe(OPENED.toISOString());
    expect(a.lastAccruedAt).toBe(OPENED.toISOString());
  });

  it('defaults opening principal to zero', () => {
    expect(openAccount({ id: 'sav-1', membershipId: MEMBER, now: OPENED }).principalPaise).toBe(0);
  });

  it('balance is principal plus net interest', () => {
    expect(balancePaise(account({ principalPaise: 100_000, netInterestPaise: 2_500 }))).toBe(102_500);
  });

  it('a deposit increases principal (the wage waterfall savings step lands here)', () => {
    expect(deposit(account({ principalPaise: 100_000 }), 20_000).principalPaise).toBe(120_000);
  });
});

describe('Savings interest — accrues to the Member, net of a disclosed fee (ADR-0016)', () => {
  it('adds gross minus fee to the net yield and carries the fee for disclosure', () => {
    const a = accrueInterest(account({ principalPaise: 100_000 }), new StubPolicy(3_000, 500), new Date(OPENED.getTime() + DAYS(30)));
    expect(a.netInterestPaise).toBe(2_500); // 3000 gross − 500 fee, to the Member
    expect(a.feePaise).toBe(500); // disclosed
    expect(a.lastAccruedAt).toBe(new Date(OPENED.getTime() + DAYS(30)).toISOString());
    expect(balancePaise(a)).toBe(102_500);
  });

  it('the whole yield is the Member\'s when there is no fee', () => {
    const a = accrueInterest(account({ principalPaise: 100_000 }), new StubPolicy(3_000, 0), new Date(OPENED.getTime() + DAYS(30)));
    expect(a.netInterestPaise).toBe(3_000);
    expect(a.feePaise).toBe(0);
  });

  it('the honest default seam yields zero until the Founder supplies a rate', () => {
    const a = accrueInterest(account({ principalPaise: 100_000 }), new NoInterestAccrualPolicy(), new Date(OPENED.getTime() + DAYS(365)));
    expect(a.netInterestPaise).toBe(0);
    expect(a.feePaise).toBe(0);
  });

  it('is a no-op when asOf is not after the last accrual (never double-counts)', () => {
    const a = account({ principalPaise: 100_000 });
    expect(accrueInterest(a, new StubPolicy(3_000, 0), OPENED)).toBe(a);
    expect(accrueInterest(a, new StubPolicy(3_000, 0), new Date(OPENED.getTime() - DAYS(1)))).toBe(a);
  });

  it('refuses a fee larger than the interest — a penalty by another name is forbidden', () => {
    expect(() => accrueInterest(account(), new StubPolicy(500, 600), new Date(OPENED.getTime() + DAYS(30)))).toThrow(/fee/);
  });
});

describe('Savings withdrawal — instant to Wallet, T+n settle, no penalty (ADR-0016)', () => {
  const WHEN = new Date('2026-07-04T09:00:00.000Z');

  it('is immediately available in the Wallet — no requested-limbo state', () => {
    const { withdrawal } = requestWithdrawal(account({ principalPaise: 100_000 }), { id: 'w-1', amountPaise: 40_000, now: WHEN, settleAfterMs: DAYS(2) });
    expect(withdrawal.state).toBe('available');
    expect(withdrawal.availableAt).toBe(WHEN.toISOString());
    expect(withdrawal.history.map((e) => e.type)).toEqual(['requested', 'available']);
  });

  it('applies NO early-withdrawal penalty — available equals requested', () => {
    const { withdrawal } = requestWithdrawal(account({ principalPaise: 100_000 }), { id: 'w-1', amountPaise: 40_000, now: WHEN, settleAfterMs: DAYS(2) });
    expect(withdrawal.amountPaise).toBe(40_000);
  });

  it('discloses the T+n settlement horizon', () => {
    const { withdrawal } = requestWithdrawal(account({ principalPaise: 100_000 }), { id: 'w-1', amountPaise: 10_000, now: WHEN, settleAfterMs: DAYS(2) });
    expect(withdrawal.settleDueAt).toBe(new Date(WHEN.getTime() + DAYS(2)).toISOString());
  });

  it('draws from net interest first, then principal, and conserves money', () => {
    const a = account({ principalPaise: 100_000, netInterestPaise: 2_500 });
    const before = balancePaise(a);
    const { account: after } = requestWithdrawal(a, { id: 'w-1', amountPaise: 3_000, now: WHEN, settleAfterMs: DAYS(2) });
    expect(after.netInterestPaise).toBe(0); // 2500 interest drained first
    expect(after.principalPaise).toBe(99_500); // then 500 from principal
    expect(before).toBe(balancePaise(after) + 3_000); // conservation
  });

  it('lets the Member withdraw their whole balance including yield', () => {
    const a = account({ principalPaise: 100_000, netInterestPaise: 2_500 });
    const { account: after } = requestWithdrawal(a, { id: 'w-1', amountPaise: 102_500, now: WHEN, settleAfterMs: DAYS(2) });
    expect(balancePaise(after)).toBe(0);
  });

  it('refuses (throws) when the amount exceeds the balance — no overdraft', () => {
    expect(() => requestWithdrawal(account({ principalPaise: 100_000 }), { id: 'w-1', amountPaise: 100_001, now: WHEN, settleAfterMs: DAYS(2) })).toThrow(/insufficient/);
  });

  it('refuses (throws) on a locked account rather than penalising it', () => {
    expect(() => requestWithdrawal(account({ locked: true }), { id: 'w-1', amountPaise: 1_000, now: WHEN, settleAfterMs: DAYS(2) })).toThrow(/locked/);
  });

  it('rejects a non-positive amount', () => {
    expect(() => requestWithdrawal(account(), { id: 'w-1', amountPaise: 0, now: WHEN, settleAfterMs: DAYS(2) })).toThrow();
  });
});

describe('Savings settlement — rail-driven, available → settled', () => {
  const WHEN = new Date('2026-07-04T09:00:00.000Z');

  it('settles an available withdrawal and appends the audit event', () => {
    const { withdrawal } = requestWithdrawal(account(), { id: 'w-1', amountPaise: 1_000, now: WHEN, settleAfterMs: DAYS(2) });
    const settled = settleWithdrawal(withdrawal, new Date(WHEN.getTime() + DAYS(2)));
    expect(settled.state).toBe('settled');
    expect(settled.settledAt).toBe(new Date(WHEN.getTime() + DAYS(2)).toISOString());
    expect(settled.history.map((e) => e.type)).toEqual(['requested', 'available', 'settled']);
  });

  it('is idempotent once settled', () => {
    const { withdrawal } = requestWithdrawal(account(), { id: 'w-1', amountPaise: 1_000, now: WHEN, settleAfterMs: DAYS(2) });
    const settled = settleWithdrawal(withdrawal, new Date(WHEN.getTime() + DAYS(2)));
    expect(settleWithdrawal(settled, new Date(WHEN.getTime() + DAYS(3)))).toBe(settled);
  });
});
