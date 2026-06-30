import { describe, expect, it } from 'vitest';
import {
  InMemorySessionStore,
  memberFromSession,
  sessionFromRequest,
  type SessionStore,
} from './session.js';

const store: SessionStore = new InMemorySessionStore({
  'sess-ramesh-001': { membershipId: 'm-001', deviceId: 'dev-ramesh-phone' },
});

function req(authorization?: string) {
  return { headers: { authorization } };
}

describe('session boundary — opaque token → Member (not the bearer-is-id stub)', () => {
  it('resolves a known session token to its bound Member', () => {
    expect(memberFromSession(req('Bearer sess-ramesh-001'), store)).toBe('m-001');
  });

  it('does NOT treat the bearer as a membership id — an id is not a token', () => {
    // The whole point of the boundary: presenting the membership id itself is
    // no longer a valid session (it would have "worked" under the old stub).
    expect(memberFromSession(req('Bearer m-001'), store)).toBeUndefined();
  });

  it('default-denies an unknown token, a missing header, and a malformed one', () => {
    expect(memberFromSession(req('Bearer not-a-real-session'), store)).toBeUndefined();
    expect(memberFromSession(req(), store)).toBeUndefined();
    expect(memberFromSession(req('sess-ramesh-001'), store)).toBeUndefined(); // no "Bearer "
    expect(memberFromSession(req('Bearer    '), store)).toBeUndefined(); // empty token
  });

  it('accepts the case-insensitive Bearer scheme and trims the token', () => {
    expect(memberFromSession(req('bearer sess-ramesh-001'), store)).toBe('m-001');
    expect(memberFromSession(req('Bearer  sess-ramesh-001  '), store)).toBe('m-001');
  });

  it('exposes the device binding on the resolved session (Book VIII §1.3)', () => {
    expect(store.resolve('sess-ramesh-001')?.deviceId).toBe('dev-ramesh-phone');
    expect(store.resolve('nope')).toBeUndefined();
  });
});

describe('session scope — full vs pre-membership (FD-S8 / ERR-1)', () => {
  it('defaults a seeded session to member scope (no churn for member-only seeds)', () => {
    const s = new InMemorySessionStore({
      'sess-a': { membershipId: 'm-a', deviceId: 'dev-a' },
    });
    expect(s.resolve('sess-a')?.scope).toBe('member');
  });

  it('carries an explicit pre_membership scope through resolve', () => {
    const s = new InMemorySessionStore({
      'sess-pros': { membershipId: 'm-pros', deviceId: 'dev-pros', scope: 'pre_membership' },
    });
    expect(s.resolve('sess-pros')?.scope).toBe('pre_membership');
  });

  it('sessionFromRequest exposes the full session incl. scope; default-denies like memberFromSession', () => {
    const s = new InMemorySessionStore({
      'sess-pros': { membershipId: 'm-pros', deviceId: 'dev-pros', scope: 'pre_membership' },
    });
    expect(sessionFromRequest(req('Bearer sess-pros'), s)).toEqual({
      membershipId: 'm-pros',
      deviceId: 'dev-pros',
      scope: 'pre_membership',
    });
    expect(sessionFromRequest(req('Bearer m-pros'), s)).toBeUndefined();
    expect(sessionFromRequest(req(), s)).toBeUndefined();
  });
});

describe('session lifecycle — issue / revoke / one active device (FD-S3)', () => {
  it('issues a fresh opaque token that resolves to the bound session', () => {
    const s = new InMemorySessionStore({}, { newToken: () => 'sess-new' });
    const token = s.issue({ membershipId: 'm-1', deviceId: 'dev-1', scope: 'member' });
    expect(token).toBe('sess-new');
    expect(s.resolve(token)).toEqual({
      membershipId: 'm-1',
      deviceId: 'dev-1',
      scope: 'member',
    });
  });

  it('revoking a token ends that session; revoking an unknown token is a no-op', () => {
    const s = new InMemorySessionStore({
      'sess-x': { membershipId: 'm-1', deviceId: 'dev-1' },
    });
    s.revoke('sess-x');
    expect(s.resolve('sess-x')).toBeUndefined();
    expect(() => s.revoke('never-existed')).not.toThrow();
  });

  it('issuing for a member REVOKES his prior device — one active bound device (FD-S3)', () => {
    let n = 0;
    const s = new InMemorySessionStore(
      { 'sess-old': { membershipId: 'm-1', deviceId: 'old-phone' } },
      { newToken: () => `sess-issued-${++n}` },
    );
    const fresh = s.issue({ membershipId: 'm-1', deviceId: 'new-phone', scope: 'member' });
    // The new device is bound; the old device's session is gone.
    expect(s.resolve(fresh)?.deviceId).toBe('new-phone');
    expect(s.resolve('sess-old')).toBeUndefined();
  });

  it('issuing for a different member leaves other members\' sessions intact', () => {
    let n = 0;
    const s = new InMemorySessionStore(
      { 'sess-a': { membershipId: 'm-a', deviceId: 'dev-a' } },
      { newToken: () => `sess-issued-${++n}` },
    );
    const bToken = s.issue({ membershipId: 'm-b', deviceId: 'dev-b', scope: 'member' });
    expect(s.resolve('sess-a')?.membershipId).toBe('m-a');
    expect(s.resolve(bToken)?.membershipId).toBe('m-b');
  });
});
