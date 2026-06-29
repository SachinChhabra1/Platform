import { describe, expect, it } from 'vitest';
import { rupees } from './money.js';
import type { WalletActivity } from './activity.js';
import {
  availableMonths,
  currentMonthOverview,
  overviewForMonth,
} from './overview.js';
import { InMemoryWalletActivitySource } from './source.js';

// The Founder-accepted prototype scenario (apps/member Wallet, Iteration 3),
// now with the two figures kept DISTINCT as spec §3 requires. May carried a
// ₹680 surplus forward; June is the wage month.
function act(
  partial: Omit<WalletActivity, 'affectsAvailable' | 'changesHoldings'> &
    Partial<Pick<WalletActivity, 'affectsAvailable' | 'changesHoldings'>>,
): WalletActivity {
  return {
    affectsAvailable: true,
    changesHoldings: true,
    ...partial,
  };
}

const LOG: readonly WalletActivity[] = [
  // May — a small surplus that carries forward into June's available balance.
  act({ id: 'a0', occurredOn: '2026-05-31', category: 'wage', direction: 'in', amount: rupees(680) }),
  // June — the money story.
  act({ id: 'a1', occurredOn: '2026-06-01', category: 'wage', direction: 'in', amount: rupees(14000) }),
  act({ id: 'a2', occurredOn: '2026-06-03', category: 'rent', direction: 'out', amount: rupees(2400) }),
  act({ id: 'a3', occurredOn: '2026-06-05', category: 'curry', direction: 'out', amount: rupees(1800) }),
  // Savings is an internal transfer: it leaves "available" but STAYS with him.
  act({
    id: 'a4',
    occurredOn: '2026-06-10',
    category: 'savings',
    direction: 'out',
    amount: rupees(2000),
    changesHoldings: false,
  }),
  act({ id: 'a5', occurredOn: '2026-06-15', category: 'remittance', direction: 'out', amount: rupees(5000) }),
];

describe('Wallet Overview — current month', () => {
  const overview = currentMonthOverview(LOG, new Date('2026-06-20T00:00:00.000Z'));

  it('covers the month derived from asOf (UTC)', () => {
    expect(overview.month).toBe('2026-06');
  });

  it('reports what came in this month', () => {
    expect(overview.received).toEqual(rupees(14000));
  });

  it('keeps "available now" and "stayed with you" as DISTINCT figures (§3)', () => {
    // Available now = carryover 680 + (14000 − 2400 − 1800 − 2000 − 5000) = 3480.
    expect(overview.availableBalance).toEqual(rupees(3480));
    // Stayed with you this month = 14000 − 2400 − 1800 − 5000 = 4800
    // (savings is NOT subtracted — it stayed with him).
    expect(overview.stayedThisMonth).toEqual(rupees(4800));
    // The whole point of the requirement: they are not the same number.
    expect(overview.availableBalance.minor).not.toBe(overview.stayedThisMonth.minor);
  });

  it('tells the money story in order, as neutral lines', () => {
    expect(overview.story.map((line) => line.activityId)).toEqual([
      'a1', 'a2', 'a3', 'a4', 'a5',
    ]);
    // A story line carries only neutral, structural data — no severity/shame.
    expect(Object.keys(overview.story[0]!).sort()).toEqual([
      'activityId', 'amount', 'category', 'direction',
    ]);
  });
});

describe('Wallet Overview — reachable history (§3)', () => {
  it('enumerates prior months, most recent first', () => {
    expect(availableMonths(LOG)).toEqual(['2026-06', '2026-05']);
  });

  it('projects a prior month on its own', () => {
    const may = overviewForMonth(LOG, '2026-05');
    expect(may.received).toEqual(rupees(680));
    expect(may.availableBalance).toEqual(rupees(680)); // running balance through May
    expect(may.story).toHaveLength(1);
  });
});

describe('Wallet Overview — a bad month reads without shame (§3, §5.4)', () => {
  // Low wage, plus an informal-debt repayment (Book II §4.5) and a deduction.
  const badMonth: readonly WalletActivity[] = [
    act({ id: 'b1', occurredOn: '2026-07-01', category: 'wage', direction: 'in', amount: rupees(9000) }),
    act({ id: 'b2', occurredOn: '2026-07-03', category: 'rent', direction: 'out', amount: rupees(2400) }),
    act({ id: 'b3', occurredOn: '2026-07-09', category: 'informal_debt_repayment', direction: 'out', amount: rupees(3000) }),
    act({ id: 'b4', occurredOn: '2026-07-12', category: 'deduction', direction: 'out', amount: rupees(1200) }),
  ];

  it('computes the lean figure plainly, with no error and no negative-as-failure', () => {
    const overview = overviewForMonth(badMonth, '2026-07');
    // 9000 − 2400 − 3000 − 1200 = 2400 stayed; lean, but just a number.
    expect(overview.stayedThisMonth).toEqual(rupees(2400));
  });

  it('represents a debt repayment exactly like any other line — no shame marker', () => {
    const overview = overviewForMonth(badMonth, '2026-07');
    const debtLine = overview.story.find(
      (line) => line.category === 'informal_debt_repayment',
    );
    const wageLine = overview.story.find((line) => line.category === 'wage');
    // Structurally identical to good news: same keys, no severity/alarm field.
    expect(Object.keys(debtLine!).sort()).toEqual(Object.keys(wageLine!).sort());
  });
});

describe('Wallet Overview — edge cases', () => {
  it('returns zeros and an empty story for a Member with no activity', () => {
    const overview = overviewForMonth([], '2026-06');
    expect(overview.received.minor).toBe(0);
    expect(overview.stayedThisMonth.minor).toBe(0);
    expect(overview.availableBalance.minor).toBe(0);
    expect(overview.story).toHaveLength(0);
    expect(availableMonths([])).toEqual([]);
  });

  it('reads from a read-only activity source by Member', async () => {
    const source = new InMemoryWalletActivitySource({ 'm-001': LOG });
    const activities = await source.listForMember('m-001');
    expect(currentMonthOverview(activities, new Date('2026-06-20T00:00:00.000Z')).availableBalance)
      .toEqual(rupees(3480));
    expect(await source.listForMember('unknown')).toEqual([]);
  });
});
