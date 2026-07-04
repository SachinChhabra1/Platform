import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { createInitialFloor, reviseFloor, type FloorValues } from './the_floor.js';
import { InMemoryFloorRegistry } from './the_floor_registry.js';
import { registerFloorRoutes } from './floor_http.js';

const R = (rupees: number): number => rupees * 100;
const T0 = new Date('2026-07-04T00:00:00.000Z');
const T1 = new Date('2026-07-05T00:00:00.000Z');
const MEMBER = 'm-001';
const SESSION = 'sess-ramesh';
const SESSION_PROSPECT = 'sess-prospect';
const BEARER = { authorization: `Bearer ${SESSION}` };

function values(overrides: Partial<FloorValues> = {}): FloorValues {
  return {
    dignityFloorPaise: R(20),
    settlementFloorPaise: R(100),
    womenDignityFloorPaise: R(30),
    overridesByMember: { 'm-secret': R(45) }, // a server-side override that must NOT leak
    ...overrides,
  };
}

let server: FastifyInstance | undefined;
let registry: InMemoryFloorRegistry;

function build(): FastifyInstance {
  registry = new InMemoryFloorRegistry();
  const app = createServer({ serviceName: 'floor-test' });
  registerFloorRoutes(app, {
    sessions: new InMemorySessionStore({
      [SESSION]: { membershipId: MEMBER, deviceId: 'dev-1' },
      [SESSION_PROSPECT]: { membershipId: 'm-pros', deviceId: 'dev-2', scope: 'pre_membership' },
    }),
    registry,
    now: () => T0,
  });
  return app;
}

const get = (bearer = BEARER) => server!.inject({ method: 'GET', url: '/v1/floor', headers: bearer });

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Floor HTTP — read-only current version (ADR-0017)', () => {
  it('returns the current published Floor with its public guarantees + audit provenance', async () => {
    server = build();
    await registry.publish(createInitialFloor({ values: values(), author: 'founder', note: 'initial floor', now: T0 }));
    const res = await get();
    expect(res.statusCode).toBe(200);
    const b = res.json();
    expect(b.version).toBe(1);
    expect(b.author).toBe('founder');
    expect(b.note).toBe('initial floor');
    expect(b.effective_at).toBe(T0.toISOString());
    expect(b.dignity_floor).toEqual({ minor: R(20), currency: 'INR' });
    expect(b.settlement_floor).toEqual({ minor: R(100), currency: 'INR' });
    expect(b.women_dignity_floor).toEqual({ minor: R(30), currency: 'INR' });
    expect(res.headers['x-nia-server-time']).toBe(T0.toISOString());
  });

  it('never leaks the server-side per-Member overrides', async () => {
    server = build();
    await registry.publish(createInitialFloor({ values: values(), author: 'founder', note: 'n', now: T0 }));
    const raw = (await get()).body;
    expect(raw).not.toContain('m-secret');
    expect(raw).not.toContain('overrides');
    expect(raw).not.toContain('4500'); // the override value
  });

  it('reflects the latest version after a revision', async () => {
    server = build();
    const v1 = createInitialFloor({ values: values(), author: 'founder', note: 'v1', now: T0 });
    await registry.publish(v1);
    await registry.publish(reviseFloor(v1, { values: values({ dignityFloorPaise: R(25) }), author: 'founder', note: 'raise', now: T1 }));
    const b = (await get()).json();
    expect(b.version).toBe(2);
    expect(b.dignity_floor).toEqual({ minor: R(25), currency: 'INR' });
  });

  it('404 when no Floor version has been published yet', async () => {
    server = build();
    expect((await get()).statusCode).toBe(404);
  });
});

describe('Floor HTTP — access control (read-only, still default-deny)', () => {
  it('401 without a session', async () => {
    server = build();
    await registry.publish(createInitialFloor({ values: values(), author: 'f', note: 'n', now: T0 }));
    expect((await server.inject({ method: 'GET', url: '/v1/floor' })).statusCode).toBe(401);
  });

  it('403 for a pre_membership session', async () => {
    server = build();
    await registry.publish(createInitialFloor({ values: values(), author: 'f', note: 'n', now: T0 }));
    expect((await get({ authorization: `Bearer ${SESSION_PROSPECT}` })).statusCode).toBe(403);
  });

  it('offers no mutation route — the app cannot change the Floor', async () => {
    server = build();
    await registry.publish(createInitialFloor({ values: values(), author: 'f', note: 'n', now: T0 }));
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
      expect((await server.inject({ method, url: '/v1/floor', headers: BEARER })).statusCode).toBe(404);
    }
  });
});
