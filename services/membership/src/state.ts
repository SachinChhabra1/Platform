/// The Membership lifecycle shape (spec 0001 §5, §13): a closed four-state
/// machine. This module owns *which transitions are legal* — nothing else.
/// Complexity stays in metadata and operating policy, never in extra states
/// (FD-4); the experiences that drive the transitions (Onboarding, Trip Home,
/// Off-boarding) live behind the §13 boundary.

/**
 * Member-facing states mapped to Nia OS's pending / active / paused / closed
 * ([A5]; spec §5). These are canonical lowercase identifiers; the Member-facing
 * labels (Prospective / Member / Paused / Closed) are presentation, owned
 * elsewhere — no internal name leaks into the Member experience (FD-3).
 */
export type MembershipState = 'prospective' | 'member' | 'paused' | 'closed';

/**
 * Legal forward transitions (spec §5 table). `closed` is terminal for this
 * Membership: return-after-closure (`Closed -> Member / Prospective`, FD-6)
 * resets tenure and is owned at the Onboarding boundary (§13) — deliberately not
 * modelled in this slice.
 */
const LEGAL_TRANSITIONS: Readonly<
  Record<MembershipState, readonly MembershipState[]>
> = {
  prospective: ['member'],
  member: ['paused', 'closed'],
  paused: ['member', 'closed'],
  closed: [],
};

/** Whether `from -> to` is a legal Membership transition. */
export function canTransition(
  from: MembershipState,
  to: MembershipState,
): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

/** Thrown when a lifecycle operation is attempted from a state that forbids it. */
export class IllegalTransitionError extends Error {
  readonly from: MembershipState;
  readonly to: MembershipState;

  constructor(from: MembershipState, to: MembershipState) {
    super(`Illegal membership transition: ${from} -> ${to}`);
    this.name = 'IllegalTransitionError';
    this.from = from;
    this.to = to;
  }
}

/** Guards a transition, throwing `IllegalTransitionError` when it is not legal. */
export function assertTransition(
  from: MembershipState,
  to: MembershipState,
): void {
  if (!canTransition(from, to)) {
    throw new IllegalTransitionError(from, to);
  }
}
