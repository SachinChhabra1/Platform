/// Service-to-service auth — the boundary for callers that are NOT Members: the
/// payment rail (webhooks), scheduled jobs, and internal tooling. Distinct from
/// the Member `SessionStore` (`@nia/runtime`): a service presents a shared SECRET,
/// not an opaque Member session.
///
/// The secret(s) are Founder/ops-owned configuration, injected at composition
/// (never invented or hard-coded here). An empty secret set authenticates NOTHING
/// — default-deny, honest emptiness until the real secret is wired. Comparison is
/// constant-time (`timingSafeEqual`) so a token cannot be guessed byte-by-byte.

import { timingSafeEqual } from 'node:crypto';

/** The header a service presents its token in (kept distinct from `Authorization`). */
export const SERVICE_TOKEN_HEADER = 'x-nia-service-token';

export interface ServiceAuthenticator {
  /** True iff `token` matches a configured service secret (constant-time). */
  authenticate(token: string | undefined): boolean;
}

/// Verifies a presented token against one or more configured secrets. Supporting a
/// SET lets a secret be rotated (old + new valid during the overlap) without
/// downtime. Empty/blank secrets are dropped, so `new SecretServiceAuthenticator([])`
/// (or all-blank) denies everything.
export class SecretServiceAuthenticator implements ServiceAuthenticator {
  readonly #secrets: readonly Buffer[];

  constructor(secrets: readonly string[]) {
    this.#secrets = secrets.filter((s) => s.length > 0).map((s) => Buffer.from(s, 'utf8'));
  }

  authenticate(token: string | undefined): boolean {
    if (!token) return false;
    const presented = Buffer.from(token, 'utf8');
    // Scan ALL secrets (no early return) so timing does not reveal which matched.
    let matched = false;
    for (const secret of this.#secrets) {
      if (secret.length === presented.length && timingSafeEqual(secret, presented)) {
        matched = true;
      }
    }
    return matched;
  }
}
