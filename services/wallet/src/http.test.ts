import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createServer } from '@nia/runtime';
import { rupees } from './money.js';
import type { WalletActivity } from './activity.js';
import { InMemoryWalletActivitySource } from './source.js';
import { registerWalletOverviewRoutes } from './http.js';

// The same Founder-accepted scenario as the read-model test, now served over
// HTTP. May carried ₹680 forward; June is the wage month.
const ASOF = new Date('2026-06-20T00:00:00.000Z');

function act(
  partial: Omit<WalletActivity, 'affectsAvailable' | 'changesHoldings'> &
    Partial<Pick<WalletActivity, 'affectsAvailable' | 'changesHoldings'>>,
): WalletActivity {
  return { affectsAvailable: true, changesHoldings: true, ...partial };
}

const LOG: readonly WalletActivity[] = [
  act({ id: 'a0', occurredOn: '2026-05-31', category: 'wage', direction: 'in', amount: rupees(680) }),
  act({ id: 'a1', occurredOn: '2026-06-01', category: 'wage', direction: 'in', amount: rupees(14000) }),
  act({ id: 'a2', occurredOn: '2026-06-03', category: 'rent', direction: 'out', amount: rupees(2400) }),
  act({ id: 'a3', occurredOn: '2026-06-05', category: 'curry', direction: 'out', amount: rupees(1800) }),
  act({ id: 'a4', occurredOn: '2026-06-10', category: 'savings', direction: 'out', amount: rupees(2000), changesHoldings: false }),
  act({ id: 'a5', occurredOn: '2026-06-15', category: 'remittance', direction: 'out', amount: rupees(5000) }),
];

const MEMBER = 'm-001';
const BEARER = { authorization: `Bearer ${MEMBER}` };

let server: FastifyInstance | undefined;

function build(): FastifyInstance {
  const app = createServer({ serviceName: 'wallet-test' });
  registerWalletOverviewRoutes(app, {
    source: new InMemoryWalletActivitySource({ [MEMBER]: LOG }),
    now: () => ASOF,
  });
  return app;
}

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('Wallet Overview HTTP — current month', () => {
  it('serves the two DISTINCT figures (§3) in snake_case paise', async () => {
    server = build();
    const response = await server.inject({
      method: 'GET',
      url: '/v1/wallet/overview',
      headers: BEARER,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.month).toBe('2026-06');
    expect(body.received).toEqual({ minor: 1_400_000, currency: 'INR' });
    // available now = 348000 paise (₹3,480); stayed = 480000 paise (₹4,800).
    expect(body.available_balance).toEqual({ minor: 348_000, currency: 'INR' });
    expect(body.stayed_this_month).toEqual({ minor: 480_000, currency: 'INR' });
    // The whole point of §3: not the same number.
    expect(body.available_balance.minor).not.toBe(body.stayed_this_month.minor);
  });

  it('maps story lines to neutral snake_case lines, in order', async () => {
    server = build();
    const body = (
      await server.inject({ method: 'GET', url: '/v1/wallet/overview', headers: BEARER })
    ).json();

    expect(body.story.map((line: { activity_id: string }) => line.activity_id)).toEqual([
      'a1', 'a2', 'a3', 'a4', 'a5',
    ]);
    expect(Object.keys(body.story[0]).sort()).toEqual([
      'activity_id', 'amount', 'category', 'direction',
    ]);
  });

  it('stamps the server-time header on the response', async () => {
    server = build();
    const response = await server.inject({
      method: 'GET',
      url: '/v1/wallet/overview',
      headers: BEARER,
    });
    expect(response.headers['x-nia-server-time']).toBe(ASOF.toISOString());
  });
});

describe('Wallet Overview HTTP — reachable history (§3)', () => {
  it('projects a requested prior month', async () => {
    server = build();
    const body = (
      await server.inject({
        method: 'GET',
        url: '/v1/wallet/overview?month=2026-05',
        headers: BEARER,
      })
    ).json();
    expect(body.month).toBe('2026-05');
    expect(body.available_balance).toEqual({ minor: 68_000, currency: 'INR' });
  });

  it('enumerates the reachable months, most recent first', async () => {
    server = build();
    const body = (
      await server.inject({
        method: 'GET',
        url: '/v1/wallet/overview/months',
        headers: BEARER,
      })
    ).json();
    expect(body).toEqual({ months: ['2026-06', '2026-05'] });
  });
});

describe('Wallet Overview HTTP — access and validation', () => {
  it('default-denies without a session (401 + error envelope)', async () => {
    server = build();
    const response = await server.inject({ method: 'GET', url: '/v1/wallet/overview' });
    expect(response.statusCode).toBe(401);
    const body = response.json();
    expect(body.code).toBe('unauthorized');
    expect(typeof body.message).toBe('string');
    expect(typeof body.correlation_id).toBe('string');
  });

  it('rejects a malformed month (400 + error envelope)', async () => {
    server = build();
    const response = await server.inject({
      method: 'GET',
      url: '/v1/wallet/overview?month=2026-6',
      headers: BEARER,
    });
    expect(response.statusCode).toBe(400);
    expect(response.json().code).toBe('invalid_month');
  });

  it('a Member with no activity reads as zeros, not an error', async () => {
    server = build();
    const body = (
      await server.inject({
        method: 'GET',
        url: '/v1/wallet/overview',
        headers: { authorization: 'Bearer someone-else' },
      })
    ).json();
    expect(body.received.minor).toBe(0);
    expect(body.stayed_this_month.minor).toBe(0);
    expect(body.available_balance.minor).toBe(0);
    expect(body.story).toEqual([]);
  });
});
