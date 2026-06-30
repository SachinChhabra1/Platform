import { describe, expect, it } from 'vitest';
import {
  InMemorySessionStore,
  memberFromSession,
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
