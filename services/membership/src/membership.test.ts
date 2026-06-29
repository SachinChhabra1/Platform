import { describe, expect, it } from 'vitest';
import {
  activate,
  close,
  createProspective,
  pause,
  relationshipTenureMonths,
  resume,
} from './membership.js';
import type { Membership } from './membership.js';
import { IllegalTransitionError, canTransition } from './state.js';
import { InMemoryMembershipRepository } from './repository.js';

const IDENTITY = { membershipId: 'm-001', name: 'Asha' };
// A first Saturday after move-in — the one birthday (FD-3). UTC for determinism.
const BIRTHDAY = new Date('2026-01-03T00:00:00.000Z');

function memberAt(at: Date = BIRTHDAY): Membership {
  return activate(createProspective(IDENTITY), at);
}

describe('Membership lifecycle', () => {
  it('starts Prospective with no tenure clock', () => {
    const m = createProspective(IDENTITY);
    expect(m.state).toBe('prospective');
    expect(m.relationshipStartedAt).toBeUndefined();
    expect(relationshipTenureMonths(m, BIRTHDAY)).toBeUndefined();
  });

  it('activates Prospective -> Member on the birthday, starting tenure (FD-3)', () => {
    const m = memberAt();
    expect(m.state).toBe('member');
    expect(m.relationshipStartedAt).toEqual(BIRTHDAY);
    expect(relationshipTenureMonths(m, BIRTHDAY)).toBe(0);
  });

  it('pauses Member -> Paused with the reason as opaque metadata (FD-4)', () => {
    const m = pause(memberAt(), {
      code: 'trip_home',
      recordedBy: { kind: 'member' },
    });
    expect(m.state).toBe('paused');
    expect(m.pauseReason?.code).toBe('trip_home');
  });

  it('accepts any new pause reason without a state-machine change (FD-4)', () => {
    // A reason the spec never enumerated, recorded by an Operator on the
    // Member's behalf (Art. XVIII) — accepted purely as data.
    const m = pause(memberAt(), {
      code: 'detention',
      note: 'temporary',
      recordedBy: { kind: 'operator', operatorId: 'op-7' },
    });
    expect(m.pauseReason?.code).toBe('detention');
    expect(m.pauseReason?.recordedBy).toEqual({
      kind: 'operator',
      operatorId: 'op-7',
    });
  });

  it('continues tenure through a pause and resume (FD-5)', () => {
    const paused = pause(memberAt(), {
      code: 'medical',
      recordedBy: { kind: 'member' },
    });
    expect(paused.relationshipStartedAt).toEqual(BIRTHDAY); // unbroken

    const resumed = resume(paused);
    expect(resumed.state).toBe('member');
    expect(resumed.relationshipStartedAt).toEqual(BIRTHDAY); // same birthday
    expect(resumed.pauseReason).toBeUndefined();
    // Five months later, tenure counts the paused span too.
    expect(
      relationshipTenureMonths(resumed, new Date('2026-06-03T00:00:00.000Z')),
    ).toBe(5);
  });

  it('closes Member -> Closed with an opaque cause', () => {
    const m = close(memberAt(), { code: 'voluntary' });
    expect(m.state).toBe('closed');
    expect(m.closureCause?.code).toBe('voluntary');
  });

  it('closes Paused -> Closed and clears the pause reason', () => {
    const paused = pause(memberAt(), {
      code: 'trip_home',
      recordedBy: { kind: 'member' },
    });
    const closed = close(paused, { code: 'policy_review' });
    expect(closed.state).toBe('closed');
    expect(closed.pauseReason).toBeUndefined();
    expect(closed.closureCause?.code).toBe('policy_review');
  });

  it('treats a removal/death closure cause as a bare tag — no FD-10/FD-13 flow', () => {
    // The cause is opaque metadata only; the removal/death *flows* are not built.
    const removed = close(memberAt(), { code: 'removal' });
    expect(removed).toEqual({
      identity: IDENTITY,
      state: 'closed',
      relationshipStartedAt: BIRTHDAY,
      closureCause: { code: 'removal' },
    });
  });
});

describe('illegal transitions', () => {
  it('rejects transitions outside the closed lifecycle', () => {
    expect(() =>
      pause(createProspective(IDENTITY), {
        code: 'x',
        recordedBy: { kind: 'member' },
      }),
    ).toThrow(IllegalTransitionError); // prospective -> paused
    expect(() => resume(memberAt())).toThrow(IllegalTransitionError); // member -> member
    expect(() => activate(memberAt(), BIRTHDAY)).toThrow(IllegalTransitionError); // member -> member
  });

  it('makes Closed terminal in this slice (return-after-closure is FD-6 / Onboarding)', () => {
    const closed = close(memberAt(), { code: 'voluntary' });
    expect(canTransition('closed', 'member')).toBe(false);
    expect(() =>
      pause(closed, { code: 'x', recordedBy: { kind: 'member' } }),
    ).toThrow(IllegalTransitionError);
  });

  it('carries from/to on the error and leaks no Member data', () => {
    let caught: unknown;
    try {
      activate(memberAt(), BIRTHDAY);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(IllegalTransitionError);
    const error = caught as IllegalTransitionError;
    expect(error.from).toBe('member');
    expect(error.to).toBe('member');
    expect(error.message).not.toContain('Asha');
  });
});

describe('MembershipRepository (in-memory adapter)', () => {
  it('round-trips a Membership by id', async () => {
    const repo = new InMemoryMembershipRepository();
    const m = memberAt();
    await repo.save(m);
    expect(await repo.findById('m-001')).toEqual(m);
  });

  it('returns undefined for an unknown id', async () => {
    const repo = new InMemoryMembershipRepository();
    expect(await repo.findById('nope')).toBeUndefined();
  });
});
