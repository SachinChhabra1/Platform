import { describe, expect, it } from 'vitest';
import { paise } from './money.js';
import {
  InMemoryArrearsLedger,
  planArrearsRecovery,
  type ArrearsCategory,
  type ArrearsRecord,
} from './arrears.js';

const R = (rupees: number): number => rupees * 100;

function rec(id: string, category: ArrearsCategory, amountRupees: number, arisenOn: string, status: 'open' | 'recovered' = 'open'): ArrearsRecord {
  return { id, membershipId: 'm-001', settlementId: id, category, amount: paise(R(amountRupees)), arisenOn, status };
}

// A 50% cap (the OD-7 ruled value) expressed as config basis points — supplied by
// the caller, never read from inside the algorithm.
const CAP_50 = 5000;

describe('planArrearsRecovery — ADR-0018 order + cap', () => {
  it('recovers nothing when there is no surplus', () => {
    const plan = planArrearsRecovery([rec('a', 'rent', 100, '2026-05-01')], 0, CAP_50);
    expect(plan).toEqual({ lines: [], totalRecoveredPaise: 0 });
  });

  it('recovers nothing when the cap is 0 (recovery disabled)', () => {
    const plan = planArrearsRecovery([rec('a', 'rent', 100, '2026-05-01')], R(1000), 0);
    expect(plan.totalRecoveredPaise).toBe(0);
  });

  it('taps only the capped fraction of surplus (50% of ₹1000 = ₹500)', () => {
    const plan = planArrearsRecovery([rec('a', 'rent', 100, '2026-05-01')], R(1000), CAP_50);
    expect(plan.totalRecoveredPaise).toBe(R(100)); // record only owes ₹100, budget ₹500 covers it
    expect(plan.lines[0]).toEqual({ id: 'a', category: 'rent', recoveredPaise: R(100), remainingPaise: 0 });
  });

  it('partially recovers a record when the budget runs out (stays owed)', () => {
    // Surplus ₹1000, cap 50% → budget ₹500; a single ₹800 rent arrear.
    const plan = planArrearsRecovery([rec('a', 'rent', 800, '2026-05-01')], R(1000), CAP_50);
    expect(plan.lines[0]).toEqual({ id: 'a', category: 'rent', recoveredPaise: R(500), remainingPaise: R(300) });
    expect(plan.totalRecoveredPaise).toBe(R(500));
  });

  it('recovers oldest-first among the Member\'s own arrears', () => {
    const arrears = [rec('newer', 'rent', 100, '2026-06-01'), rec('older', 'curry', 100, '2026-05-01')];
    // budget = 50% of ₹300 = ₹150 → clears the older ₹100, then ₹50 of the newer.
    const plan = planArrearsRecovery(arrears, R(300), CAP_50);
    expect(plan.lines.map((l) => l.id)).toEqual(['older', 'newer']);
    expect(plan.lines[1]!.remainingPaise).toBe(R(50));
  });

  it('recovers Nia\'s own fee/advance LAST — after every Member-owed arrear, even older ones', () => {
    // The Nia arrear (fee) is the OLDEST, but recovers last (preserves OD-1 "Nia last").
    const arrears = [
      rec('fee', 'membershipFee', 100, '2026-04-01'), // oldest, but Nia-owed
      rec('rent', 'rent', 100, '2026-06-01'), // newer, but Member-owed
    ];
    // budget = 50% of ₹1000 = ₹500 → covers both; order must be rent (Member) then fee (Nia).
    const plan = planArrearsRecovery(arrears, R(1000), CAP_50);
    expect(plan.lines.map((l) => l.id)).toEqual(['rent', 'fee']);
  });

  it('skips already-recovered records', () => {
    const arrears = [rec('done', 'rent', 100, '2026-05-01', 'recovered'), rec('open', 'curry', 100, '2026-05-02')];
    const plan = planArrearsRecovery(arrears, R(1000), CAP_50);
    expect(plan.lines.map((l) => l.id)).toEqual(['open']);
  });

  it('rejects an invalid surplus or cap', () => {
    expect(() => planArrearsRecovery([], -1, CAP_50)).toThrow();
    expect(() => planArrearsRecovery([], R(100), 10_001)).toThrow();
    expect(() => planArrearsRecovery([], R(100), -1)).toThrow();
  });
});

describe('InMemoryArrearsLedger.applyRecovery — ADR-0018 status transitions', () => {
  it('marks a fully-recovered record recovered (with audit) and drops it from open', async () => {
    const ledger = new InMemoryArrearsLedger();
    await ledger.recordArrears([rec('a', 'rent', 100, '2026-05-01')]);
    const plan = planArrearsRecovery(await ledger.listOpenArrears('m-001'), R(1000), CAP_50);
    await ledger.applyRecovery('m-001', plan, { settlementId: 's-2', recoveredOn: '2026-07-04' });
    expect(await ledger.listOpenArrears('m-001')).toEqual([]); // no longer open
  });

  it('a partial recovery reduces the amount but keeps the record open', async () => {
    const ledger = new InMemoryArrearsLedger();
    await ledger.recordArrears([rec('a', 'rent', 800, '2026-05-01')]);
    const plan = planArrearsRecovery(await ledger.listOpenArrears('m-001'), R(1000), CAP_50); // recovers ₹500 of ₹800
    await ledger.applyRecovery('m-001', plan, { settlementId: 's-2', recoveredOn: '2026-07-04' });
    const open = await ledger.listOpenArrears('m-001');
    expect(open).toHaveLength(1);
    expect(open[0]!.amount.minor).toBe(R(300)); // still owed
    expect(open[0]!.status).toBe('open');
  });

  it('leaves records the plan did not touch unchanged', async () => {
    const ledger = new InMemoryArrearsLedger();
    await ledger.recordArrears([rec('a', 'rent', 100, '2026-05-01'), rec('b', 'curry', 100, '2026-05-02')]);
    // A plan that only recovers 'a'.
    await ledger.applyRecovery('m-001', { lines: [{ id: 'a', category: 'rent', recoveredPaise: R(100), remainingPaise: 0 }], totalRecoveredPaise: R(100) }, { settlementId: 's-2', recoveredOn: '2026-07-04' });
    const open = await ledger.listOpenArrears('m-001');
    expect(open.map((r) => r.id)).toEqual(['b']);
    expect(open[0]!.amount.minor).toBe(R(100));
  });
});
