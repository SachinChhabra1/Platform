/// The session/auth boundary shared by Nia backend services.
///
/// Replaces the earlier PRE-AUTH stub, where the bearer token WAS the membership
/// id, with a real indirection: an OPAQUE session token is resolved, server-side,
/// to the Member it binds (Book VIII §1.3, §1.4). Callers never assume the token
/// means anything — they ask the [SessionStore]. Default-deny: no token, or a
/// token the store does not know, yields no Member.
///
/// This is the engineering boundary only. How a Member OBTAINS a session —
/// phone verification, device binding, human-mediated recovery (Book VIII §1.3) —
/// is product behaviour (spec 0002). The issuance HTTP surface (`POST /v1/sessions`)
/// is a later slice; the store-level `issue`/`revoke` MECHANISM lives here so the
/// model (scope + one-active-device, FD-S3/FD-S8) is testable independent of HTTP.

import { randomUUID } from 'node:crypto';

/**
 * What a session is permitted to reach (spec 0002 FD-S8 / ERR-1).
 *   • `pre_membership` — a Prospective mid-onboarding (J-S0): onboarding status
 *     ONLY, never Wallet, Membership, or benefits.
 *   • `member` — a full Member session: the bound device is his (J-S1).
 */
export type SessionScope = 'pre_membership' | 'member';

/** A resolved, validated session — what an opaque token binds to. */
export interface Session {
  /** The Member (or Prospective) this session authenticates. */
  readonly membershipId: string;
  /** The device the session is bound to (Book VIII §1.3). */
  readonly deviceId: string;
  /** What the session may reach (FD-S8). A full Member session is `member`. */
  readonly scope: SessionScope;
}

/**
 * Port: the session store. Resolves an opaque token to a validated [Session]
 * (default-deny on unknown/invalid) and is the single place a session is created
 * or ended:
 *   • `issue(session)` — mint a fresh opaque token bound to the session, and,
 *     because a Member has exactly ONE active bound device (FD-S3), revoke any
 *     session already held by that membership id.
 *   • `revoke(token)` — end a session (sign-out, device cut-off, recovery, Closed
 *     force-end). Idempotent: revoking an unknown token is a no-op.
 */
export interface SessionStore {
  resolve(token: string): Session | undefined;
  issue(session: Session): string;
  revoke(token: string): void;
}

/** A seed session: like [Session] but `scope` may be omitted (defaults to
 *  `member`), so existing member-only seeds need no change. */
type SeedSession = Omit<Session, 'scope'> & { readonly scope?: SessionScope };

/** Options for [InMemorySessionStore]. */
export interface InMemorySessionStoreOptions {
  /** Mints a fresh opaque token on `issue`. Injectable for deterministic tests;
   *  defaults to a `sess-` prefixed UUID. */
  readonly newToken?: () => string;
}

/**
 * In-memory [SessionStore] for the prototype/dev: a mutable `token → Session`
 * map. Seeded by each service's composition root (so the surfaces are runnable);
 * `issue`/`revoke` make it live (the issuance HTTP surface that drives them is a
 * later slice). State is lost on restart — a Postgres-backed store is a later
 * ADR-0006 slice.
 */
export class InMemorySessionStore implements SessionStore {
  private readonly sessions: Map<string, Session>;
  private readonly newToken: () => string;

  constructor(
    seed: Readonly<Record<string, SeedSession>> = {},
    options: InMemorySessionStoreOptions = {},
  ) {
    this.sessions = new Map(
      Object.entries(seed).map(([token, s]) => [
        token,
        { ...s, scope: s.scope ?? 'member' },
      ]),
    );
    this.newToken = options.newToken ?? (() => `sess-${randomUUID()}`);
  }

  resolve(token: string): Session | undefined {
    return this.sessions.get(token);
  }

  /** Mint a token for `session`, revoking any session that membership already
   *  holds first (one active bound device, FD-S3). Returns the new token. */
  issue(session: Session): string {
    for (const [token, existing] of this.sessions) {
      if (existing.membershipId === session.membershipId) {
        this.sessions.delete(token);
      }
    }
    const token = this.newToken();
    this.sessions.set(token, session);
    return token;
  }

  /** End a session. No-op if the token is unknown. */
  revoke(token: string): void {
    this.sessions.delete(token);
  }
}

/** The minimal request shape the resolver reads — just the Authorization header.
 *  `authorization` is `string | undefined` to match Fastify's `IncomingHttpHeaders`
 *  (and to accept an explicitly-absent header under exactOptionalPropertyTypes). */
export interface BearerCarrier {
  readonly headers: { readonly authorization?: string | undefined };
}

/**
 * Resolve the full [Session] from a request's bearer token, via the store.
 * Default-deny (Book VIII §1.4): a missing header, a malformed `Authorization`,
 * or a token the store does not know all yield `undefined`. Callers that must
 * enforce scope (FD-S8) read `session.scope`; those that only need the Member id
 * can use [memberFromSession].
 */
export function sessionFromRequest(
  request: BearerCarrier,
  store: SessionStore,
): Session | undefined {
  const header = request.headers.authorization;
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  if (!token) return undefined;
  return store.resolve(token);
}

/**
 * Resolve the signed-in Member id from a request's bearer session token, via the
 * store. A thin projection of [sessionFromRequest] for callers that don't need
 * the scope. Returns the membership id on a valid session, else `undefined`.
 */
export function memberFromSession(
  request: BearerCarrier,
  store: SessionStore,
): string | undefined {
  return sessionFromRequest(request, store)?.membershipId;
}
