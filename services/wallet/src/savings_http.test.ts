import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { openAccount, type InterestAccrualPolicy } from './savings.js';
import { InMemorySavingsAccountStore, InMemoryWithdrawalStore } from './savings_ledger.js';
import { registerSavingsRoutes } from './savings_http.js';

const MEMBER = 'm-001';
const OTHER = 'm-002';
const SESSION = 'sess-ramesh';
const SESSION_OTHER = 'sess-other';
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}`, 'content-type': 'application/json' };
const OPENED = new Date('2026-06-01T00:00:00.000Z');
const ASOF = new Date('2026-07-04T09:00:00.000Z');
const DAYS = (n: number): number => n * 24 * 60 * 60 * 1000;

/** Test-only accrual policy (the rate/formula is Founder-owned config behind the seam). */
class StubPolicy implements InterestAccrualPolicy {
  constructor(
    private readonly gross: number,
    private readonly fee: number,
  ) {}
  accrue(): { readonly grossPaise: number; readonly feePaise: number } {
    return { grossPaise: this.gross, feePaise: this.fee };
  }
}

let server: FastifyInstance | undefined;
let accounts: InMemorySavingsAccountStore;
let withdrawals: InMemoryWithdrawalStore;
let counter: number;
let clock: Date;

function build(policy: InterestAccrualPolicy = new StubPolicy(0, 0)): FastifyInstance {
  accounts = new InMemorySavingsAccountStore();
  withdrawals = new InMemoryWithdrawalStore();
  counter = 0;
  clock = ASOF;
  const app = createServer({ serviceName: 'savings-test' });
  registerSavingsRoutes(app, {
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' },
      [SESSION_OTHER]: { membershipId: OTHER, deviceId: 'dev-2' },
      [SESSION_PROSPECT]: { membershipId: 'm-pros', deviceId: 'dev-3', scope: 'pre_membership' },
    }),
    accounts,
    withdrawals,
    policy,
    settleAfterMs: DAYS(2),
    now: () => clock,
    newId: () => `w-${++counter}`,
  });
  return app;
}

/** Seed a savings account (deposits arrive server-side; not a Member endpoint). */
async function seedAccount(overrides: { principalPaise?: number; locked?: boolean; member?: string } = {}): Promise<void> {
  await accounts.save(
    openAccount({
      id: `sav-${overrides.member ?? MEMBER}`,
      membershipId: overrides.member ?? MEMBER,
      now: OPENED,
      openingPrincipalPaise: overrides.principalPaise ?? 100_000,
      locked: overrides.locked ?? false,
    }),
  );
}

const post = (url: string, payload: Record<string, unknown>, bearer = BEARER) =>
  server!.inject({ method: 'POST', url, headers: bearer, payload });
const get = (url: string, bearer = BEARER) =>
  server!.inject({ method: 'GET', url, headers: { authorization: bearer.authorization } });

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Savings HTTP — account read (interest accrued to now)', () => {
  it('returns the account with interest accrued net of the disclosed fee', async () => {
    server = build(new StubPolicy(3_000, 500));
    await seedAccount({ principalPaise: 100_000 });
    const res = await get('/v1/savings/account');
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.principal).toEqual({ minor: 100_000, currency: 'INR' });
    expect(b.accrued_interest).toEqual({ minor: 3_000, currency: 'INR' }); // gross
    expect(b.fee_charged).toEqual({ minor: 500, currency: 'INR' }); // disclosed
    expect(b.net_interest).toEqual({ minor: 2_500, currency: 'INR' }); // to the Member
    expect(b.balance).toEqual({ minor: 102_500, currency: 'INR' });
    expect(b.locked).toBe(false);
    expect(res.headers['x-nia-server-time']).toBe(ASOF.toISOString());
  });

  it('404 when the Member has no savings account yet', async () => {
    server = build();
    expect((await get('/v1/savings/account')).statusCode).toBe(404);
  });
});

describe('Savings HTTP — withdrawal (instant available, T+n settle, no penalty)', () => {
  it('withdraws: 201, immediately available, amount unpenalised, settlement disclosed', async () => {
    server = build(new StubPolicy(0, 0));
    await seedAccount({ principalPaise: 100_000 });
    const res = await post('/v1/savings/withdrawals', { amount: { minor: 40_000, currency: 'INR' } });
    expect(res.statusCode).toBe(201);
    const b = res.json();
    expect(b.id).toBe('w-1');
    expect(b.state).toBe('available');
    expect(b.amount).toEqual({ minor: 40_000, currency: 'INR' });
    expect(b.available_at).toBe(ASOF.toISOString());
    expect(b.settle_due_at).toBe(new Date(ASOF.getTime() + DAYS(2)).toISOString());
    expect(b.history.map((e: { type: string }) => e.type)).toEqual(['requested', 'available']);
    // the account was debited
    expect((await get('/v1/savings/account')).json().balance).toEqual({ minor: 60_000, currency: 'INR' });
  });

  it('lets the Member withdraw the accrued yield too', async () => {
    server = build(new StubPolicy(3_000, 500));
    await seedAccount({ principalPaise: 100_000 });
    const res = await post('/v1/savings/withdrawals', { amount: { minor: 102_500, currency: 'INR' } });
    expect(res.statusCode).toBe(201);
    expect((await get('/v1/savings/account')).json().balance).toEqual({ minor: 0, currency: 'INR' });
  });

  it('409 when the amount exceeds the balance (no overdraft)', async () => {
    server = build();
    await seedAccount({ principalPaise: 100_000 });
    const res = await post('/v1/savings/withdrawals', { amount: { minor: 100_001, currency: 'INR' } });
    expect(res.statusCode).toBe(409);
    expect(res.json().code).toBe('withdrawal_refused');
  });

  it('409 on a locked account (refused, not penalised)', async () => {
    server = build();
    await seedAccount({ principalPaise: 100_000, locked: true });
    expect((await post('/v1/savings/withdrawals', { amount: { minor: 1_000, currency: 'INR' } })).statusCode).toBe(409);
  });

  it('400 on a malformed amount', async () => {
    server = build();
    await seedAccount();
    for (const amount of [{ minor: 0, currency: 'INR' }, { minor: 1.5, currency: 'INR' }, { minor: 1, currency: 'USD' }]) {
      expect((await post('/v1/savings/withdrawals', { amount })).statusCode).toBe(400);
    }
  });

  it('404 when withdrawing with no savings account', async () => {
    server = build();
    expect((await post('/v1/savings/withdrawals', { amount: { minor: 1_000, currency: 'INR' } })).statusCode).toBe(404);
  });

  it('lists and reads back a withdrawal with its audit history', async () => {
    server = build();
    await seedAccount({ principalPaise: 100_000 });
    await post('/v1/savings/withdrawals', { amount: { minor: 10_000, currency: 'INR' } });
    expect((await get('/v1/savings/withdrawals')).json().withdrawals.map((w: { id: string }) => w.id)).toEqual(['w-1']);
    const one = (await get('/v1/savings/withdrawals/w-1')).json();
    expect(one.id).toBe('w-1');
    expect(one.state).toBe('available');
  });
});

describe('Savings HTTP — access control', () => {
  it('default-denies without a session (401)', async () => {
    server = build();
    expect((await server.inject({ method: 'GET', url: '/v1/savings/account' })).statusCode).toBe(401);
  });

  it('forbids a pre_membership session (403)', async () => {
    server = build();
    const res = await get('/v1/savings/account', { authorization: `Bearer ${SESSION_PROSPECT}`, 'content-type': 'application/json' });
    expect(res.statusCode).toBe(403);
  });

  it('another Member cannot read your withdrawal (404, no existence leak)', async () => {
    server = build();
    await seedAccount({ principalPaise: 100_000 });
    await post('/v1/savings/withdrawals', { amount: { minor: 10_000, currency: 'INR' } }); // w-1, MEMBER
    const other = { authorization: `Bearer ${SESSION_OTHER}` };
    expect((await server.inject({ method: 'GET', url: '/v1/savings/withdrawals/w-1', headers: other })).statusCode).toBe(404);
  });

  it('a Member sees only their own savings account', async () => {
    server = build();
    await seedAccount({ principalPaise: 100_000, member: OTHER });
    // MEMBER has no account of their own → 404, never OTHER's
    expect((await get('/v1/savings/account')).statusCode).toBe(404);
  });
});
