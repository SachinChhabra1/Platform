/// The Membership entity and its lifecycle operations (spec 0001 §3–§5, §13).
///
/// Membership *is* the product — "the continuing relationship between the Member
/// and Nia" (spec §3; Book I Art. I). This module models that relationship as an
/// immutable record advanced by named lifecycle operations, each mapping to a
/// transition Membership owns in the §13 boundary contracts. Operations are
/// pure: they take the current Membership and return the next one (no clock, no
/// I/O), so the state machine is fully deterministic and unit-testable.
/// Persistence lives behind MembershipRepository (repository.ts); the
/// experiences that *drive* these transitions live behind the §13 boundary.

import { assertTransition } from './state.js';
import type { MembershipState } from './state.js';

/**
 * Who performed a lifecycle action. The Operator may act on the Member's behalf
 * (FD-4; Book I Art. XVIII), and such actions must be attributable.
 */
export type Actor =
  | { readonly kind: 'member' }
  | { readonly kind: 'operator'; readonly operatorId: string };

/**
 * Why a Membership is Paused. Opaque metadata on the Paused state, never an
 * enumeration that drives the state machine (FD-4): `code` is a free string, so
 * new reasons (medical, detention, employment gap, …) are added as data with no
 * change to the lifecycle.
 */
export interface PauseReason {
  readonly code: string;
  readonly note?: string;
  readonly recordedBy: Actor;
}

/**
 * Why a Membership Closed. Opaque metadata, mirroring PauseReason (FD-4 spirit).
 * This is ONLY the cause tag on the Closed state — the removal (FD-10) and death
 * (FD-13) *flows* (restoration due process, dignity determination, nominee
 * settlement) are deliberately NOT implemented here; they require legal review
 * before any flow is built (spec §14 carried items).
 */
export interface ClosureCause {
  readonly code: string;
  readonly note?: string;
}

/**
 * The Member's identity as Membership needs it. Minimal by design: the lifecycle
 * needs a stable id ([A6]) and the name the Member is known by (spec §3, "known
 * by name, not number"). The full onboarding identity set (§6.5) is captured by
 * the Onboarding spec and attaches to richer slices as they need it.
 */
export interface MembershipIdentity {
  readonly membershipId: string;
  readonly name: string;
}

export interface Membership {
  readonly identity: MembershipIdentity;
  readonly state: MembershipState;
  /**
   * When the `Prospective -> Member` birthday occurred — the single start of
   * both Membership and Relationship Tenure (FD-3). Tenure continues through
   * Paused (FD-5). INTERNAL: never surfaced to the Member (Q4); no Member-facing
   * value derives from it. Absent until the Membership is activated.
   */
  readonly relationshipStartedAt?: Date;
  /** Present only while `state === 'paused'` (FD-4). */
  readonly pauseReason?: PauseReason;
  /** Present only while `state === 'closed'`. */
  readonly closureCause?: ClosureCause;
}

// Carries the tenure clock across a transition without tripping
// exactOptionalPropertyTypes (omit the key entirely when it is absent).
function carryTenure(
  membership: Membership,
): { relationshipStartedAt: Date } | Record<string, never> {
  return membership.relationshipStartedAt !== undefined
    ? { relationshipStartedAt: membership.relationshipStartedAt }
    : {};
}

/**
 * Creates a Prospective record — "a person Nia intends to serve; guarantees not
 * yet applied" (spec §5). Creation is Operator-mediated in early production
 * ([A3]; Q1), but that is the onboarding *flow*; the domain only holds the
 * Prospective state until activation.
 */
export function createProspective(identity: MembershipIdentity): Membership {
  return { identity, state: 'prospective' };
}

/**
 * `Prospective -> Member`: the one birthday (FD-3). Sets the start of
 * Relationship Tenure. Fired on the Onboarding completion signal (§13); the
 * completion criteria themselves belong to Onboarding.
 */
export function activate(membership: Membership, at: Date): Membership {
  assertTransition(membership.state, 'member');
  return {
    identity: membership.identity,
    state: 'member',
    relationshipStartedAt: at,
  };
}

/**
 * `Member -> Paused`: continuity preserved, not an absence classified (FD-4).
 * Tenure continues untouched (FD-5). The reason is recorded as opaque metadata.
 */
export function pause(membership: Membership, reason: PauseReason): Membership {
  assertTransition(membership.state, 'paused');
  return {
    identity: membership.identity,
    state: 'paused',
    ...carryTenure(membership),
    pauseReason: reason,
  };
}

/**
 * `Paused -> Member`: the Member returns (§4.7). Tenure is unbroken — the pause
 * preserved continuity (FD-5) — so the birthday carries across unchanged, and
 * the pause reason is cleared.
 */
export function resume(membership: Membership): Membership {
  assertTransition(membership.state, 'member');
  return {
    identity: membership.identity,
    state: 'member',
    ...carryTenure(membership),
  };
}

/**
 * `Member -> Closed` or `Paused -> Closed`: the relationship ends (§4.8).
 * Records the opaque closure cause and clears any pause reason. The settlement
 * and the removal/death *experiences* are owned by Off-boarding behind the §13
 * boundary and are not implemented here.
 */
export function close(membership: Membership, cause: ClosureCause): Membership {
  assertTransition(membership.state, 'closed');
  return {
    identity: membership.identity,
    state: 'closed',
    ...carryTenure(membership),
    closureCause: cause,
  };
}

/**
 * Relationship Tenure in whole months as of `asOf`, or `undefined` before the
 * Member birthday. INTERNAL ONLY (FD-3, Q4): this must never be surfaced to the
 * Member. Computed in UTC so the result is deterministic regardless of host
 * timezone. Tenure resets only after a Closed Membership returns (FD-6), which
 * is an Onboarding-boundary concern not modelled in this slice.
 */
export function relationshipTenureMonths(
  membership: Membership,
  asOf: Date,
): number | undefined {
  const started = membership.relationshipStartedAt;
  if (started === undefined) return undefined;
  const months =
    (asOf.getUTCFullYear() - started.getUTCFullYear()) * 12 +
    (asOf.getUTCMonth() - started.getUTCMonth());
  return months < 0 ? 0 : months;
}
