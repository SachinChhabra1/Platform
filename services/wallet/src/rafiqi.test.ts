import { describe, expect, it } from 'vitest';
import {
  authorizeAction,
  checkReversibility,
  grantAuthorization,
  isGrantActive,
  reverseAction,
  revokeGrant,
  takeAction,
  type AuthorizationGrant,
} from './rafiqi.js';
import { InMemoryGrantStore, InMemoryRafiqiActionStore } from './rafiqi_ledger.js';

const T0 = new Date('2026-07-04T09:00:00.000Z');
const plus = (ms: number): Date => new Date(T0.getTime() + ms);
const HOURS = (n: number): number => n * 60 * 60 * 1000;
const R = (rupees: number): number => rupees * 100;

function grant(over: Partial<Parameters<typeof grantAuthorization>[0]> = {}): AuthorizationGrant {
  return grantAuthorization({
    id: 'g-1',
    membershipId: 'm-001',
    actionType: 'store_swap',
    capPaise: R(500),
    now: T0,
    ttlMs: HOURS(24 * 30), // 30 days
    ...over,
  });
}

describe('RafiQi standing authorisation — scoped, capped, time-bounded, revocable (ADR-0014)', () => {
  it('an active grant auto-authorises a matching action within the cap', () => {
    const d = authorizeAction({ actionType: 'store_swap', amountPaise: R(300) }, [grant()], plus(HOURS(1)));
    expect(d).toEqual({ outcome: 'auto', grantId: 'g-1' });
  });

  it('an action OVER the cap falls back to per-action confirmation', () => {
    const d = authorizeAction({ actionType: 'store_swap', amountPaise: R(600) }, [grant()], plus(HOURS(1)));
    expect(d).toEqual({ outcome: 'needs_confirmation', reason: 'over_cap' });
  });

  it('a different action-type is NOT covered (scope) — needs confirmation', () => {
    const d = authorizeAction({ actionType: 'move_savings', amountPaise: R(100) }, [grant()], plus(HOURS(1)));
    expect(d).toEqual({ outcome: 'needs_confirmation', reason: 'no_grant' });
  });

  it('an expired grant does not authorise (time-bounded) — needs confirmation', () => {
    const g = grant({ ttlMs: HOURS(1) });
    expect(isGrantActive(g, plus(HOURS(2)))).toBe(false);
    const d = authorizeAction({ actionType: 'store_swap', amountPaise: R(100) }, [g], plus(HOURS(2)));
    expect(d).toEqual({ outcome: 'needs_confirmation', reason: 'grant_inactive' });
  });

  it('a revoked grant does not authorise (revocable) — needs confirmation', () => {
    const g = revokeGrant(grant(), plus(HOURS(1)));
    expect(g.revokedAt).toBeDefined();
    const d = authorizeAction({ actionType: 'store_swap', amountPaise: R(100) }, [g], plus(HOURS(2)));
    expect(d).toEqual({ outcome: 'needs_confirmation', reason: 'grant_inactive' });
  });

  it('with NO grant at all, every action needs per-action confirmation (the fallback)', () => {
    expect(authorizeAction({ actionType: 'store_swap', amountPaise: R(1) }, [], T0)).toEqual({
      outcome: 'needs_confirmation',
      reason: 'no_grant',
    });
  });
});

describe('RafiQi action reversibility — 24h undo (ADR-0014)', () => {
  it('a taken action is reversible with a 24h window; reversing within it works', () => {
    const a = takeAction({ id: 'a-1', membershipId: 'm-001', actionType: 'store_swap', amountPaise: R(300), now: T0, via: { kind: 'auto', grantId: 'g-1' } });
    expect(a.state).toBe('reversible');
    expect(a.reversibleUntil).toBe(plus(HOURS(24)).toISOString());
    expect(a.grantId).toBe('g-1');

    const reversed = reverseAction(a, plus(HOURS(5)));
    expect(reversed.state).toBe('reversed');
    expect(reversed.history.map((e) => e.type)).toEqual(['taken', 'reversed']);
  });

  it('records HOW it was authorised (auto grant vs Member confirmation)', () => {
    const confirmed = takeAction({ id: 'a-2', membershipId: 'm-001', actionType: 'move_savings', amountPaise: R(100), now: T0, via: { kind: 'confirmed' } });
    expect(confirmed.authorization).toBe('confirmed');
    expect(confirmed.grantId).toBeUndefined();
  });

  it('cannot reverse after the 24h window has closed', () => {
    const a = takeAction({ id: 'a-3', membershipId: 'm-001', actionType: 'store_swap', amountPaise: R(300), now: T0, via: { kind: 'confirmed' } });
    expect(() => reverseAction(a, plus(HOURS(25)))).toThrow();
  });

  it('settles once the window elapses; a settled action cannot be reversed', () => {
    const a = takeAction({ id: 'a-4', membershipId: 'm-001', actionType: 'store_swap', amountPaise: R(300), now: T0, via: { kind: 'confirmed' } });
    expect(checkReversibility(a, plus(HOURS(23))).state).toBe('reversible'); // still in window
    const settled = checkReversibility(a, plus(HOURS(24)));
    expect(settled.state).toBe('settled');
    expect(settled.history.map((e) => e.type)).toEqual(['taken', 'settled']);
    expect(() => reverseAction(settled, plus(HOURS(25)))).toThrow();
  });

  it('a reversed action is not re-settled by a later sweep', () => {
    const a = takeAction({ id: 'a-5', membershipId: 'm-001', actionType: 'store_swap', amountPaise: R(300), now: T0, via: { kind: 'confirmed' } });
    const reversed = reverseAction(a, plus(HOURS(2)));
    expect(checkReversibility(reversed, plus(HOURS(48))).state).toBe('reversed');
  });
});

describe('RafiQi ledger — grants and actions are auditable by id/Member', () => {
  it('grant store distinguishes active from all (audit keeps revoked/expired)', async () => {
    const store = new InMemoryGrantStore();
    await store.save(grant({ id: 'g-active' }));
    await store.save(revokeGrant(grant({ id: 'g-revoked' }), plus(HOURS(1))));

    expect((await store.listForMember('m-001')).map((g) => g.id).sort()).toEqual(['g-active', 'g-revoked']);
    expect((await store.listActiveForMember('m-001', plus(HOURS(2)))).map((g) => g.id)).toEqual(['g-active']);
  });

  it('an action taken under an active grant round-trips through the store, keyed by id', async () => {
    const grants = new InMemoryGrantStore();
    const actions = new InMemoryRafiqiActionStore();
    await grants.save(grant());

    const active = await grants.listActiveForMember('m-001', plus(HOURS(1)));
    const decision = authorizeAction({ actionType: 'store_swap', amountPaise: R(300) }, active, plus(HOURS(1)));
    expect(decision.outcome).toBe('auto');

    const a = takeAction({
      id: 'a-99',
      membershipId: 'm-001',
      actionType: 'store_swap',
      amountPaise: R(300),
      now: plus(HOURS(1)),
      via: decision.outcome === 'auto' ? { kind: 'auto', grantId: decision.grantId } : { kind: 'confirmed' },
    });
    await actions.save(a);

    const saved = await actions.get('a-99');
    expect(saved?.grantId).toBe('g-1');
    expect(saved?.state).toBe('reversible');
    expect((await actions.listForMember('m-001')).map((x) => x.id)).toEqual(['a-99']);
  });
});
