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
/// is product behaviour not yet Engineering-Locked and is deliberately not built
/// here; the in-memory store is seeded by each service's composition root so the
/// surfaces are demonstrably runnable.

/** A resolved, validated session — what an opaque token binds to. */
export interface Session {
  /** The Member this session authenticates. */
  readonly membershipId: string;
  /** The device the session is bound to (Book VIII §1.3). */
  readonly deviceId: string;
}

/**
 * Port: resolves an opaque session token to a validated [Session], or
 * `undefined` if the token is unknown/invalid. The only thing a service trusts
 * to turn a bearer token into a Member.
 */
export interface SessionStore {
  resolve(token: string): Session | undefined;
}

/**
 * In-memory [SessionStore] for the prototype/dev: a fixed `token → Session` map.
 * Real sessions are issued after phone verification with device binding (Book
 * VIII §1.3) — that issuance flow is not built (unspec'd). Seeded by `start.ts`.
 */
export class InMemorySessionStore implements SessionStore {
  private readonly sessions: ReadonlyMap<string, Session>;

  constructor(sessions: Readonly<Record<string, Session>>) {
    this.sessions = new Map(Object.entries(sessions));
  }

  resolve(token: string): Session | undefined {
    return this.sessions.get(token);
  }
}

/** The minimal request shape the resolver reads — just the Authorization header.
 *  `authorization` is `string | undefined` to match Fastify's `IncomingHttpHeaders`
 *  (and to accept an explicitly-absent header under exactOptionalPropertyTypes). */
export interface BearerCarrier {
  readonly headers: { readonly authorization?: string | undefined };
}

/**
 * Resolve the signed-in Member from a request's bearer session token, via the
 * store. Default-deny (Book VIII §1.4): a missing header, a malformed
 * `Authorization`, or a token the store does not know all yield `undefined` —
 * the caller then answers 401. Returns the membership id on a valid session.
 */
export function memberFromSession(
  request: BearerCarrier,
  store: SessionStore,
): string | undefined {
  const header = request.headers.authorization;
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  if (!token) return undefined;
  return store.resolve(token)?.membershipId;
}
