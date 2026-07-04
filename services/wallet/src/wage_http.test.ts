import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { InMemoryFloorSource } from './floor.js';
import { InMemoryArrearsLedger } from './arrears.js';
import { registerWageSettlementRoutes } from './wage_http.js';

// Amounts in paise via a rupee helper.
const R = (rupees: number): number => rupees * 100;
const money = (rupees: number) => ({ minor: R(rupees), currency: 'INR' as const });

// Claims total = ₹150. Nia's own claims (fee ₹10, advance ₹25) are last.
const CLAIMS = {
  rent: money(30),
  curry: money(20),
  remittance: money(50),
  savings: money(15),
  membership_fee: money(10),
  advance_repayment: money(25),
};
const CLAIMS_TOTAL = R(150);

const MEMBER = 'm-001';
const PROSPECT = 'm-pros';
const SESSION = 'sess-ramesh-001';
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}`, 'content-type': 'application/json' };

let server: FastifyInstance | undefined;
let ledger: InMemoryArrearsLedger;

// Default injected floor ₹20 unless a test overrides it. This is the seam — the
// value lives server-side, never in the request. A fresh arrears ledger is wired
// each build and exposed via the module-level `ledger` for assertions.
function build(floorRupees = 20): FastifyInstance {
  ledger = new InMemoryArrearsLedger();
  const app = createServer({ serviceName: 'wage-test' });
  registerWageSettlementRoutes(app, {
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' },
      [SESSION_PROSPECT]: { membershipId: PROSPECT, deviceId: 'dev-2', scope: 'pre_membership' },
    }),
    floor: new InMemoryFloorSource({ default: R(floorRupees) }),
    arrears: ledger,
    now: () => new Date('2026-07-04T00:00:00.000Z'),
  });
  return app;
}

function settle(payload: Record<string, unknown>) {
  return server!.inject({ method: 'POST', url: '/v1/wage/settlements', headers: BEARER, payload });
}

const paidSum = (b: { paid: Record<string, { minor: number }> }): number =>
  Object.values(b.paid).reduce((s, m) => s + m.minor, 0);

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Wage settlement HTTP — ADR-0012 behaviour', () => {
  it('a full wage pays every claim and returns the surplus as take-home', async () => {
    server = build(20);
    const wage = R(20) + CLAIMS_TOTAL + R(30); // floor + claims + ₹30 surplus
    const res = await settle({ wage: money(200), claims: CLAIMS, cause: 'none' });
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.shortfall).toBe(false);
    expect(b.floor_breached).toBe(false);
    expect(b.paid.remittance).toEqual({ minor: R(50), currency: 'INR' });
    expect(b.take_home).toEqual({ minor: R(50), currency: 'INR' }); // floor 20 + surplus 30
    expect(b.take_home.minor + paidSum(b)).toBe(wage); // money conserved
  });

  it('on a shortfall Nia is cut first: fee/advance defer, family is protected', async () => {
    server = build(20);
    // floor + rent + curry + remittance + savings, but not fee/advance.
    const wage = R(20) + R(30) + R(20) + R(50) + R(15); // ₹135
    const b = (await settle({ wage: { minor: wage, currency: 'INR' }, claims: CLAIMS, cause: 'member_caused' })).json();
    expect(b.shortfall).toBe(true);
    expect(b.paid.remittance).toEqual({ minor: R(50), currency: 'INR' });
    expect(b.paid.membership_fee).toEqual({ minor: 0, currency: 'INR' });
    expect(b.arrears.membership_fee).toEqual({ minor: R(10), currency: 'INR' });
    expect(b.arrears.advance_repayment).toEqual({ minor: R(25), currency: 'INR' });
    expect(b.take_home).toEqual({ minor: R(20), currency: 'INR' });
    expect(b.take_home.minor + paidSum(b)).toBe(wage);
  });

  it('employer-caused shortfall waives the membership fee (not carried)', async () => {
    server = build(20);
    const wage = R(20) + R(30) + R(20) + R(50) + R(15);
    const b = (await settle({ wage: { minor: wage, currency: 'INR' }, claims: CLAIMS, cause: 'employer_caused' })).json();
    expect(b.waived_membership_fee).toEqual({ minor: R(10), currency: 'INR' });
    expect(b.arrears.membership_fee).toEqual({ minor: 0, currency: 'INR' }); // waived, not carried
    expect(b.arrears.advance_repayment).toEqual({ minor: R(25), currency: 'INR' }); // advance still carries
  });
});

describe('Wage settlement HTTP — the client CANNOT lower the dignity floor (OD-6)', () => {
  it('ignores a client-supplied floor; uses the injected server-side floor', async () => {
    server = build(20); // injected floor ₹20
    // A hostile body: wage exactly equals the claims total (no room for a floor)
    // AND smuggles dignity_floor/floor = 0 to try to zero the protection.
    const b = (
      await settle({
        wage: { minor: CLAIMS_TOTAL, currency: 'INR' },
        claims: CLAIMS,
        cause: 'member_caused',
        dignity_floor: 0,
        floor: { minor: 1, currency: 'INR' },
      })
    ).json();
    // Injected floor honoured: ₹20 reaches the Member; had the client's 0 been
    // used, take-home would be 0 and every claim would be paid.
    expect(b.take_home).toEqual({ minor: R(20), currency: 'INR' });
    // The ₹20 came out of the LAST claim (advance), never the family/rent/food.
    expect(b.arrears.advance_repayment).toEqual({ minor: R(20), currency: 'INR' });
    expect(b.paid.rent).toEqual({ minor: R(30), currency: 'INR' });
    expect(b.paid.remittance).toEqual({ minor: R(50), currency: 'INR' });
  });

  it('take-home tracks the INJECTED floor, not the identical client body', async () => {
    // Same hostile body; only the server-side injected floor differs.
    const body = {
      wage: { minor: CLAIMS_TOTAL, currency: 'INR' },
      claims: CLAIMS,
      cause: 'member_caused',
      dignity_floor: 0,
    };
    server = build(20);
    const low = (await settle(body)).json();
    await server.close();
    server = build(50);
    const high = (await settle(body)).json();
    expect(low.take_home.minor).toBe(R(20));
    expect(high.take_home.minor).toBe(R(50));
  });

  it('a wage below the floor breaches it and escalates (floor is inviolable)', async () => {
    server = build(20);
    const b = (await settle({ wage: money(12), claims: CLAIMS, cause: 'employer_caused' })).json();
    expect(b.floor_breached).toBe(true);
    expect(b.shortfall).toBe(true);
    expect(b.take_home).toEqual({ minor: R(12), currency: 'INR' }); // Member keeps all there was
    expect(b.paid.rent).toEqual({ minor: 0, currency: 'INR' }); // no claim paid ahead of the floor
  });
});

describe('Wage settlement HTTP — arrears carry forward (ADR-0012)', () => {
  it('records the deferred claims as open arrears for the Member', async () => {
    server = build(20);
    const wage = R(20) + R(30) + R(20) + R(50) + R(15); // fee + advance defer
    await settle({ wage: { minor: wage, currency: 'INR' }, claims: CLAIMS, cause: 'member_caused' });
    const open = await ledger.listOpenArrears(MEMBER);
    expect(open.map((r) => r.category)).toEqual(['membershipFee', 'advanceRepayment']);
    expect(open.map((r) => r.amount.minor)).toEqual([R(10), R(25)]);
    expect(open.every((r) => r.status === 'open' && r.arisenOn === '2026-07-04')).toBe(true);
    // Member-caused: the fee carried as arrears, so there is NO waiver.
    expect(await ledger.listWaivers(MEMBER)).toEqual([]);
  });

  it('records the waived fee as a DISTINCT waiver on an employer-caused shortfall', async () => {
    server = build(20);
    const wage = R(20) + R(30) + R(20) + R(50) + R(15);
    await settle({ wage: { minor: wage, currency: 'INR' }, claims: CLAIMS, cause: 'employer_caused' });
    // The fee is NOT in arrears...
    expect((await ledger.listOpenArrears(MEMBER)).map((r) => r.category)).toEqual(['advanceRepayment']);
    // ...it is a waiver, recorded distinctly, with its reason and amount.
    const waivers = await ledger.listWaivers(MEMBER);
    expect(waivers).toHaveLength(1);
    expect(waivers[0]).toMatchObject({
      category: 'membershipFee',
      reason: 'employer_caused_shortfall',
      status: 'waived',
    });
    expect(waivers[0]!.amount.minor).toBe(R(10));
  });

  it('the ledger reconciles to the returned WageAllocation (arrears + waiver)', async () => {
    server = build(20);
    const wage = R(20) + R(30) + R(20) + R(50) + R(15);
    const alloc = (await settle({ wage: { minor: wage, currency: 'INR' }, claims: CLAIMS, cause: 'employer_caused' })).json();

    const arrears = await ledger.listOpenArrears(MEMBER);
    const waivers = await ledger.listWaivers(MEMBER);
    // Every recorded arrears amount equals the amount the response reported.
    for (const r of arrears) {
      expect(r.amount.minor).toBe(alloc.arrears[r.category === 'advanceRepayment' ? 'advance_repayment' : r.category].minor);
    }
    // The recorded waiver equals the response's waived fee.
    expect(waivers[0]!.amount.minor).toBe(alloc.waived_membership_fee.minor);
    // Full identity: what was not paid this cycle = recorded arrears + recorded waiver.
    const recorded = arrears.reduce((s, r) => s + r.amount.minor, 0) + (waivers[0]?.amount.minor ?? 0);
    const claimsTotal = CLAIMS_TOTAL;
    const paidSum = Object.values(alloc.paid).reduce((s: number, m) => s + (m as { minor: number }).minor, 0);
    expect(recorded).toBe(claimsTotal - paidSum);
  });

  it('records no arrears and no waiver when the wage covers everything', async () => {
    server = build(20);
    await settle({ wage: money(200), claims: CLAIMS, cause: 'none' });
    expect(await ledger.listOpenArrears(MEMBER)).toEqual([]);
    expect(await ledger.listWaivers(MEMBER)).toEqual([]);
  });
});

describe('Wage settlement HTTP — access and validation', () => {
  it('default-denies without a session (401 + envelope)', async () => {
    server = build();
    const res = await server.inject({
      method: 'POST',
      url: '/v1/wage/settlements',
      headers: { 'content-type': 'application/json' },
      payload: { wage: money(100), claims: CLAIMS, cause: 'none' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().code).toBe('unauthorized');
  });

  it('forbids a pre_membership session (403)', async () => {
    server = build();
    const res = await server.inject({
      method: 'POST',
      url: '/v1/wage/settlements',
      headers: { authorization: `Bearer ${SESSION_PROSPECT}`, 'content-type': 'application/json' },
      payload: { wage: money(100), claims: CLAIMS, cause: 'none' },
    });
    expect(res.statusCode).toBe(403);
    expect(res.json().code).toBe('forbidden');
  });

  it('rejects a malformed body (400 + envelope)', async () => {
    server = build();
    const bad: Record<string, unknown>[] = [
      { wage: { minor: 1.5, currency: 'INR' }, claims: CLAIMS, cause: 'none' }, // non-integer paise
      { wage: money(100), claims: CLAIMS, cause: 'nope' }, // bad cause
      { wage: money(100), cause: 'none' }, // missing claims
      { wage: money(100), claims: { ...CLAIMS, rent: undefined }, cause: 'none' }, // missing a claim
    ];
    for (const payload of bad) {
      const res = await settle(payload);
      expect(res.statusCode).toBe(400);
      expect(typeof res.json().code).toBe('string');
      expect(typeof res.json().correlation_id).toBe('string');
    }
  });

  it('stamps the server-time header', async () => {
    server = build();
    const res = await settle({ wage: money(100), claims: CLAIMS, cause: 'none' });
    expect(res.headers['x-nia-server-time']).toBe('2026-07-04T00:00:00.000Z');
  });
});
