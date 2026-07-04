import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '@nia/runtime';
import { openAccount, requestWithdrawal, type InterestAccrualPolicy } from './savings.js';
import {
  accrueAllSavings,
  settleDueWithdrawals,
  InMemorySavingsAccountStore,
  InMemoryWithdrawalStore,
} from './savings_ledger.js';
import {
  InMemoryOperatorEscalations,
  InMemoryRemittanceStore,
} from './remittance_ledger.js';
import { SecretServiceAuthenticator } from './service_auth.js';
import { registerOpsRoutes } from './ops_http.js';

const R = (rupees: number): number => rupees * 100;
const SECRET = 'ops-secret';
const OPENED = new Date('2026-06-01T00:00:00.000Z');
const LATER = new Date('2026-07-01T00:00:00.000Z');
const DAYS = (n: number): number => n * 24 * 60 * 60 * 1000;
const svc = (token = SECRET) => ({ 'x-nia-service-token': token });

class StubPolicy implements InterestAccrualPolicy {
  constructor(private readonly gross: number, private readonly fee: number) {}
  accrue(): { readonly grossPaise: number; readonly feePaise: number } {
    return { grossPaise: this.gross, feePaise: this.fee };
  }
}

describe('accrueAllSavings — interest job (ADR-0016)', () => {
  it('accrues interest on every account and is a no-op when re-run at the same instant', async () => {
    const accounts = new InMemorySavingsAccountStore();
    await accounts.save(openAccount({ id: 's-1', membershipId: 'm-1', now: OPENED, openingPrincipalPaise: R(1000) }));
    await accounts.save(openAccount({ id: 's-2', membershipId: 'm-2', now: OPENED, openingPrincipalPaise: R(500) }));

    const first = await accrueAllSavings(LATER, { accounts, policy: new StubPolicy(R(30), R(5)) });
    expect(first).toEqual({ scanned: 2, accrued: 2 });
    expect((await accounts.get('s-1'))?.netInterestPaise).toBe(R(25)); // 30 gross − 5 fee

    // Re-run at the SAME instant: accrual is a no-op (never double-counts).
    const again = await accrueAllSavings(LATER, { accounts, policy: new StubPolicy(R(30), R(5)) });
    expect(again).toEqual({ scanned: 2, accrued: 0 });
    expect((await accounts.get('s-1'))?.netInterestPaise).toBe(R(25));
  });
});

describe('settleDueWithdrawals — settlement job (ADR-0016)', () => {
  async function seedWithdrawal(withdrawals: InMemoryWithdrawalStore): Promise<void> {
    const account = openAccount({ id: 's-1', membershipId: 'm-1', now: OPENED, openingPrincipalPaise: R(1000) });
    const { withdrawal } = requestWithdrawal(account, { id: 'w-1', amountPaise: R(400), now: OPENED, settleAfterMs: DAYS(2) });
    await withdrawals.save(withdrawal); // state 'available', settleDueAt = OPENED + 2d
  }

  it('does not settle before the T+n time', async () => {
    const withdrawals = new InMemoryWithdrawalStore();
    await seedWithdrawal(withdrawals);
    const res = await settleDueWithdrawals(new Date(OPENED.getTime() + DAYS(1)), { withdrawals });
    expect(res.settled).toEqual([]);
    expect((await withdrawals.get('w-1'))?.state).toBe('available');
  });

  it('settles once the T+n time has passed, and is idempotent', async () => {
    const withdrawals = new InMemoryWithdrawalStore();
    await seedWithdrawal(withdrawals);
    const at = new Date(OPENED.getTime() + DAYS(2));
    expect((await settleDueWithdrawals(at, { withdrawals })).settled).toEqual(['w-1']);
    expect((await withdrawals.get('w-1'))?.state).toBe('settled');
    // A second run finds nothing due (already settled).
    expect((await settleDueWithdrawals(at, { withdrawals })).settled).toEqual([]);
  });
});

describe('Ops HTTP — savings jobs (service-authed)', () => {
  let server: FastifyInstance | undefined;
  let accounts: InMemorySavingsAccountStore;
  let withdrawals: InMemoryWithdrawalStore;

  function build(at: Date): FastifyInstance {
    accounts = new InMemorySavingsAccountStore();
    withdrawals = new InMemoryWithdrawalStore();
    const app = createServer({ serviceName: 'ops-savings-test' });
    registerOpsRoutes(app, {
      auth: new SecretServiceAuthenticator([SECRET]),
      remittance: { store: new InMemoryRemittanceStore(), operator: new InMemoryOperatorEscalations() },
      savings: { accounts, withdrawals, policy: new StubPolicy(R(30), R(0)) },
      now: () => at,
    });
    return app;
  }

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('runs the accrual job (401 without a token)', async () => {
    server = build(LATER);
    await accounts.save(openAccount({ id: 's-1', membershipId: 'm-1', now: OPENED, openingPrincipalPaise: R(1000) }));
    expect((await server.inject({ method: 'POST', url: '/v1/ops/savings-accrual' })).statusCode).toBe(401);
    const res = await server.inject({ method: 'POST', url: '/v1/ops/savings-accrual', headers: svc() });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ scanned: 1, accrued: 1 });
  });

  it('runs the settlement job', async () => {
    const at = new Date(OPENED.getTime() + DAYS(3));
    server = build(at);
    const account = openAccount({ id: 's-1', membershipId: 'm-1', now: OPENED, openingPrincipalPaise: R(1000) });
    const { withdrawal } = requestWithdrawal(account, { id: 'w-1', amountPaise: R(400), now: OPENED, settleAfterMs: DAYS(2) });
    await withdrawals.save(withdrawal);
    const res = await server.inject({ method: 'POST', url: '/v1/ops/savings-settle-withdrawals', headers: svc() });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ settled: ['w-1'] });
  });
});
