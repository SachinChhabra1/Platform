import { describe, expect, it } from 'vitest';
import { grantAuthorization, type RafiqiAction } from './rafiqi.js';
import { InMemoryGrantStore, InMemoryRafiqiActionStore } from './rafiqi_ledger.js';
import {
  autoTake,
  confirmedTake,
  reverseWithCompensation,
  NoMoneyEffect,
  type MoneyEffect,
  type OrchestratorDeps,
} from './rafiqi_orchestrator.js';

const R = (n: number): number => n * 100;
const T0 = new Date('2026-07-04T09:00:00.000Z');
const HOURS = (n: number): number => n * 60 * 60 * 1000;

/// A recording money effect: proves the orchestrator applies/reverses the money
/// path at the right moments (the concrete semantics are the impl's, not tested here).
class RecordingEffect implements MoneyEffect {
  readonly applied: string[] = [];
  readonly reversed: string[] = [];
  async apply(action: RafiqiAction): Promise<void> {
    this.applied.push(action.id);
  }
  async reverse(action: RafiqiAction): Promise<void> {
    this.reversed.push(action.id);
  }
}

function deps(effect: MoneyEffect, clock: Date, counterStart = 0): OrchestratorDeps {
  let n = counterStart;
  return {
    grants: new InMemoryGrantStore(),
    actions: new InMemoryRafiqiActionStore(),
    effect,
    now: () => clock,
    newId: () => `act-${++n}`,
  };
}

describe('RafiQi orchestrator — auto-take (ADR-0014)', () => {
  it('takes automatically under an active covering grant and applies the money effect', async () => {
    const effect = new RecordingEffect();
    const d = deps(effect, T0);
    await d.grants.save(grantAuthorization({ id: 'g1', membershipId: 'm-1', actionType: 'store_swap', capPaise: R(500), now: T0, ttlMs: HOURS(24 * 30) }));

    const res = await autoTake({ membershipId: 'm-1', actionType: 'store_swap', amountPaise: R(300) }, d);
    expect(res.outcome).toBe('taken');
    if (res.outcome !== 'taken') return;
    expect(res.action.authorization).toBe('auto');
    expect(res.action.state).toBe('reversible');
    expect(effect.applied).toEqual([res.action.id]); // money moved after the action was recorded
    expect((await d.actions.get(res.action.id))?.id).toBe(res.action.id); // persisted
  });

  it('falls back to needs_confirmation (over cap / no grant) and takes NOTHING', async () => {
    const effect = new RecordingEffect();
    const d = deps(effect, T0);
    await d.grants.save(grantAuthorization({ id: 'g1', membershipId: 'm-1', actionType: 'store_swap', capPaise: R(100), now: T0, ttlMs: HOURS(24) }));

    const overCap = await autoTake({ membershipId: 'm-1', actionType: 'store_swap', amountPaise: R(300) }, d);
    expect(overCap).toEqual({ outcome: 'needs_confirmation', reason: 'over_cap' });
    const noGrant = await autoTake({ membershipId: 'm-1', actionType: 'other', amountPaise: R(10) }, d);
    expect(noGrant).toEqual({ outcome: 'needs_confirmation', reason: 'no_grant' });
    expect(effect.applied).toEqual([]); // nothing taken, no money moved
  });

  it('confirmedTake records a confirmed action and applies the effect', async () => {
    const effect = new RecordingEffect();
    const d = deps(effect, T0);
    const action = await confirmedTake({ membershipId: 'm-1', actionType: 'store_swap', amountPaise: R(300) }, d);
    expect(action.authorization).toBe('confirmed');
    expect(effect.applied).toEqual([action.id]);
  });
});

describe('RafiQi orchestrator — reversal compensation (24h window)', () => {
  it('reverses within the window and compensates (undoes) the money effect', async () => {
    const effect = new RecordingEffect();
    const d = deps(effect, T0);
    const action = await confirmedTake({ membershipId: 'm-1', actionType: 'store_swap', amountPaise: R(300) }, d);

    const laterDeps: OrchestratorDeps = { ...d, now: () => new Date(T0.getTime() + HOURS(5)) };
    const reversed = await reverseWithCompensation(action.id, laterDeps);
    expect(reversed.state).toBe('reversed');
    expect(effect.reversed).toEqual([action.id]); // the inverse money movement ran
  });

  it('does not reverse (or compensate) once the 24h window has closed', async () => {
    const effect = new RecordingEffect();
    const d = deps(effect, T0);
    const action = await confirmedTake({ membershipId: 'm-1', actionType: 'store_swap', amountPaise: R(300) }, d);

    const tooLate: OrchestratorDeps = { ...d, now: () => new Date(T0.getTime() + HOURS(25)) };
    await expect(reverseWithCompensation(action.id, tooLate)).rejects.toThrow();
    expect(effect.reversed).toEqual([]); // no compensation on a failed reversal
  });

  it('throws on an unknown action id', async () => {
    const d = deps(new NoMoneyEffect(), T0);
    await expect(reverseWithCompensation('missing', d)).rejects.toThrow(/no such/);
  });
});
