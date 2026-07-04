import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import {
  createInitialFloor,
  resolveDignityFloor,
  reviseFloor,
  type FloorValues,
} from './the_floor.js';
import { InMemoryFloorRegistry, RegistryFloorSource } from './the_floor_registry.js';
import { InMemoryArrearsLedger } from './arrears.js';
import { registerWageSettlementRoutes } from './wage_http.js';

const R = (rupees: number): number => rupees * 100;
const T0 = new Date('2026-07-04T00:00:00.000Z');
const T1 = new Date('2026-07-05T00:00:00.000Z');

// Explicit test fixtures — NOT invented policy. The Floor's real values are
// Founder-owned; these are only here to exercise the mechanism.
function values(overrides: Partial<FloorValues> = {}): FloorValues {
  return {
    dignityFloorPaise: R(20),
    settlementFloorPaise: R(100),
    womenDignityFloorPaise: R(30),
    overridesByMember: {},
    ...overrides,
  };
}

describe('The Floor — versioning + audit (ADR-0017)', () => {
  it('the first version is version 1 with its audit provenance', () => {
    const v1 = createInitialFloor({ values: values(), author: 'founder', note: 'initial floor', now: T0 });
    expect(v1.version).toBe(1);
    expect(v1.supersedesVersion).toBeUndefined();
    expect(v1.author).toBe('founder');
    expect(v1.note).toBe('initial floor');
    expect(v1.publishedAt).toBe(T0.toISOString());
  });

  it('a revision is a NEW version that supersedes the current one (append, never rewrite)', () => {
    const v1 = createInitialFloor({ values: values({ dignityFloorPaise: R(20) }), author: 'founder', note: 'v1', now: T0 });
    const v2 = reviseFloor(v1, { values: values({ dignityFloorPaise: R(30) }), author: 'founder', note: 'raise floor', now: T1 });
    expect(v2.version).toBe(2);
    expect(v2.supersedesVersion).toBe(1);
    expect(v2.values.dignityFloorPaise).toBe(R(30));
    expect(v1.values.dignityFloorPaise).toBe(R(20)); // the prior version is untouched
  });

  it('refuses negative or non-integer Floor values (never a silent bad floor)', () => {
    expect(() => createInitialFloor({ values: values({ dignityFloorPaise: -1 }), author: 'f', note: 'n', now: T0 })).toThrow();
    expect(() => createInitialFloor({ values: values({ womenDignityFloorPaise: 1.5 }), author: 'f', note: 'n', now: T0 })).toThrow();
    expect(() => createInitialFloor({ values: values({ overridesByMember: { 'm-1': -5 } }), author: 'f', note: 'n', now: T0 })).toThrow();
  });

  it('resolves a Member floor: server-side override wins, else the baseline', () => {
    const v = createInitialFloor({ values: values({ dignityFloorPaise: R(20), overridesByMember: { 'm-woman': R(30) } }), author: 'f', note: 'n', now: T0 });
    expect(resolveDignityFloor(v, 'm-woman')).toBe(R(30)); // FD-11 higher floor attached to the Member
    expect(resolveDignityFloor(v, 'm-other')).toBe(R(20)); // baseline
  });
});

describe('The Floor registry — append-only history is the audit trail', () => {
  it('publishes versions in order and reports the current one', async () => {
    const reg = new InMemoryFloorRegistry();
    const v1 = createInitialFloor({ values: values(), author: 'founder', note: 'v1', now: T0 });
    await reg.publish(v1);
    expect((await reg.current())?.version).toBe(1);
    const v2 = reviseFloor(v1, { values: values({ dignityFloorPaise: R(30) }), author: 'founder', note: 'v2', now: T1 });
    await reg.publish(v2);
    expect((await reg.current())?.version).toBe(2);
    expect((await reg.history()).map((v) => v.version)).toEqual([1, 2]);
    expect((await reg.get(1))?.values.dignityFloorPaise).toBe(R(20)); // history preserved, auditable
  });

  it('refuses to skip or rewrite a version (append-only invariant)', async () => {
    const reg = new InMemoryFloorRegistry();
    const v1 = createInitialFloor({ values: values(), author: 'f', note: 'v1', now: T0 });
    await reg.publish(v1);
    await expect(reg.publish(v1)).rejects.toThrow(/append-only/); // re-publishing v1 would rewrite history
    const skip = reviseFloor(reviseFloor(v1, { values: values(), author: 'f', note: 'x', now: T1 }), { values: values(), author: 'f', note: 'y', now: T1 });
    await expect(reg.publish(skip)).rejects.toThrow(/append-only/); // v3 before v2
  });

  it('starts empty (no Floor published yet)', async () => {
    expect(await new InMemoryFloorRegistry().current()).toBeUndefined();
  });
});

describe('RegistryFloorSource — the server-side accessor plugged into the seam', () => {
  it('reads the current version and resolves the Member floor', async () => {
    const reg = new InMemoryFloorRegistry();
    await reg.publish(createInitialFloor({ values: values({ dignityFloorPaise: R(20), overridesByMember: { 'm-woman': R(30) } }), author: 'f', note: 'n', now: T0 }));
    const src = new RegistryFloorSource(reg);
    expect(await src.dignityFloorPaise('m-other')).toBe(R(20));
    expect(await src.dignityFloorPaise('m-woman')).toBe(R(30));
  });

  it('refuses to serve a floor when none is published (a settlement must not run floorless)', async () => {
    await expect(new RegistryFloorSource(new InMemoryFloorRegistry()).dignityFloorPaise('m-1')).rejects.toThrow(/no_floor_published/);
  });
});

describe('Wage settlement reads the Floor from the versioned registry (OD-6 × OD-1)', () => {
  const MEMBER = 'm-001';
  const SESSION = 'sess-ramesh-001';
  const BEARER = { authorization: `Bearer ${SESSION}`, 'content-type': 'application/json' };
  const money = (rupees: number) => ({ minor: R(rupees), currency: 'INR' as const });
  const CLAIMS = { rent: money(30), curry: money(20), remittance: money(50), savings: money(15), membership_fee: money(10), advance_repayment: money(25) };

  let server: FastifyInstance | undefined;
  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  function buildWage(registry: InMemoryFloorRegistry): FastifyInstance {
    const app = createServer({ serviceName: 'wage-floor-test' });
    registerWageSettlementRoutes(app, {
      sessions: new InMemorySessionStore({ [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' } }),
      floor: new RegistryFloorSource(registry),
      arrears: new InMemoryArrearsLedger(),
      now: () => T0,
    });
    return app;
  }

  it('take-home tracks the registry floor, and a revision moves it (audited, server-side)', async () => {
    const reg = new InMemoryFloorRegistry();
    const v1 = createInitialFloor({ values: values({ dignityFloorPaise: R(20) }), author: 'founder', note: 'v1', now: T0 });
    await reg.publish(v1);
    server = buildWage(reg);
    // A shortfall wage covering claims to remittance + savings but not fee/advance,
    // so take-home lands exactly on the dignity floor.
    const wage = R(20) + R(30) + R(20) + R(50) + R(15); // floor 20 + rent/curry/remittance/savings
    const b1 = (await server.inject({ method: 'POST', url: '/v1/wage/settlements', headers: BEARER, payload: { wage: { minor: wage, currency: 'INR' }, claims: CLAIMS, cause: 'member_caused' } })).json();
    expect(b1.take_home).toEqual({ minor: R(20), currency: 'INR' }); // reads v1's floor

    // The Founder raises the floor to ₹30 — a new audited version, no code change.
    await reg.publish(reviseFloor(v1, { values: values({ dignityFloorPaise: R(30) }), author: 'founder', note: 'raise floor', now: T1 }));
    const b2 = (await server.inject({ method: 'POST', url: '/v1/wage/settlements', headers: BEARER, payload: { wage: { minor: wage + R(10), currency: 'INR' }, claims: CLAIMS, cause: 'member_caused' } })).json();
    expect(b2.take_home).toEqual({ minor: R(30), currency: 'INR' }); // now reads v2's floor
  });
});
