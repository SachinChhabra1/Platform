/// Persistence boundary for Membership (ports & adapters).
///
/// The domain (membership.ts, state.ts) stays pure; this port is the only seam
/// to storage. The in-memory adapter below makes the whole service testable with
/// no infrastructure. The PostgreSQL adapter (ADR-0006) is a later slice, added
/// when a slice has a concrete persistence consumer — keeping this one small and
/// reversible.

import type { Membership } from './membership.js';

/** The storage seam for Memberships, keyed by stable membership id ([A6]). */
export interface MembershipRepository {
  save(membership: Membership): Promise<void>;
  findById(membershipId: string): Promise<Membership | undefined>;
}

/** A process-memory adapter — for tests and the not-yet-persistent service. */
export class InMemoryMembershipRepository implements MembershipRepository {
  readonly #store = new Map<string, Membership>();

  async save(membership: Membership): Promise<void> {
    this.#store.set(membership.identity.membershipId, membership);
  }

  async findById(membershipId: string): Promise<Membership | undefined> {
    return this.#store.get(membershipId);
  }
}
