/// RafiQi authorization + reversibility — the domain for "RafiQi acts for the
/// Member, but the Member decides" (R5; ruling: ADR-0014 / OD-3, locked in
/// /ENGINEERING_LOCK.md).
///
/// Two locked rules:
///  1. A standing authorisation is EXPLICIT, scoped by action-type AND a rupee
///     cap, time-bounded (expires), and revocable at any time — every grant and
///     use logged. Outside an active covering grant, RafiQi must fall back to
///     PER-ACTION CONFIRMATION.
///  2. Every RafiQi-initiated money action is REVERSIBLE for 24h before it settles.
///
/// Policy lives here; the stores (`rafiqi_ledger.ts`) only record. Amounts are
/// integer paise (`money.ts`). `actionType` is an open code (data, not policy),
/// like the wallet ledger categories. Independent of arrears/OD-7.
///
/// NOTE (bounded context): co-located in the wallet money domain (the offline dev
/// sandbox cannot add a new pnpm workspace member). Extract to `services/rafiqi`
/// (ADR-0004) when online.

function assertPaise(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer paise value, got ${value}`);
  }
}

// --- Standing authorisation (the grant) -----------------------------------

export interface AuthorizationGrant {
  readonly id: string;
  readonly membershipId: string;
  /** The action-type this grant authorises (scope). Open code, data not policy. */
  readonly actionType: string;
  /** The per-action rupee cap, in integer paise. An action over this is not covered. */
  readonly capPaise: number;
  readonly grantedAt: string;
  /** Time-bound: the grant is inactive at/after this instant. */
  readonly expiresAt: string;
  /** Set when the Member revokes it; a revoked grant authorises nothing. */
  readonly revokedAt?: string | undefined;
}

export interface GrantInput {
  readonly id: string;
  readonly membershipId: string;
  readonly actionType: string;
  readonly capPaise: number;
  readonly now: Date;
  /** How long the grant lasts from `now`, in milliseconds (explicit, time-bounded). */
  readonly ttlMs: number;
}

export function grantAuthorization(input: GrantInput): AuthorizationGrant {
  assertPaise('capPaise', input.capPaise);
  if (!Number.isInteger(input.ttlMs) || input.ttlMs <= 0) {
    throw new RangeError(`ttlMs must be a positive integer, got ${input.ttlMs}`);
  }
  return {
    id: input.id,
    membershipId: input.membershipId,
    actionType: input.actionType,
    capPaise: input.capPaise,
    grantedAt: input.now.toISOString(),
    expiresAt: new Date(input.now.getTime() + input.ttlMs).toISOString(),
  };
}

/** Revoke a grant (idempotent — re-revoking keeps the first revocation time). */
export function revokeGrant(grant: AuthorizationGrant, now: Date): AuthorizationGrant {
  if (grant.revokedAt !== undefined) return grant;
  return { ...grant, revokedAt: now.toISOString() };
}

/** Active = not revoked and not yet expired. */
export function isGrantActive(grant: AuthorizationGrant, now: Date): boolean {
  if (grant.revokedAt !== undefined) return false;
  return now.getTime() < Date.parse(grant.expiresAt);
}

// --- The authorisation decision -------------------------------------------

export type AuthorizationOutcome =
  | { readonly outcome: 'auto'; readonly grantId: string }
  | { readonly outcome: 'needs_confirmation'; readonly reason: 'no_grant' | 'grant_inactive' | 'over_cap' };

/// Decide whether a proposed RafiQi action may proceed silently (covered by an
/// active grant scoped to its type and within the cap) or must fall back to
/// per-action confirmation. The `reason` makes the fallback auditable/explainable.
export function authorizeAction(
  action: { readonly actionType: string; readonly amountPaise: number },
  grants: readonly AuthorizationGrant[],
  now: Date,
): AuthorizationOutcome {
  assertPaise('amountPaise', action.amountPaise);
  const sameType = grants.filter((g) => g.actionType === action.actionType);
  const active = sameType.filter((g) => isGrantActive(g, now));
  const covering = active.find((g) => action.amountPaise <= g.capPaise);
  if (covering) return { outcome: 'auto', grantId: covering.id };
  if (active.length > 0) return { outcome: 'needs_confirmation', reason: 'over_cap' };
  if (sameType.length > 0) return { outcome: 'needs_confirmation', reason: 'grant_inactive' };
  return { outcome: 'needs_confirmation', reason: 'no_grant' };
}

// --- The reversible action ------------------------------------------------

export type RafiqiActionState = 'reversible' | 'reversed' | 'settled';
export type RafiqiActionEventType = 'taken' | 'reversed' | 'settled';

export interface RafiqiActionEvent {
  readonly type: RafiqiActionEventType;
  readonly at: string;
}

export interface RafiqiAction {
  readonly id: string;
  readonly membershipId: string;
  readonly actionType: string;
  readonly amountPaise: number;
  readonly takenAt: string;
  /** takenAt + 24h. Within this window the Member can reverse; after it, it settles. */
  readonly reversibleUntil: string;
  /** How it was authorised: an active grant ('auto') or the Member confirmed ('confirmed'). */
  readonly authorization: 'auto' | 'confirmed';
  readonly grantId?: string | undefined;
  readonly state: RafiqiActionState;
  readonly history: readonly RafiqiActionEvent[];
}

const REVERSIBLE_MS = 24 * 60 * 60 * 1000;

export interface TakeActionInput {
  readonly id: string;
  readonly membershipId: string;
  readonly actionType: string;
  readonly amountPaise: number;
  readonly now: Date;
  /** The resolved authorisation: an active grant, or an explicit Member confirmation. */
  readonly via: { readonly kind: 'auto'; readonly grantId: string } | { readonly kind: 'confirmed' };
}

/// Take a RafiQi action. It starts `reversible` with a 24h undo window. The caller
/// must have resolved authorisation first (`authorizeAction` → act, or prompt +
/// confirm); this records HOW it was authorised for the audit trail.
export function takeAction(input: TakeActionInput): RafiqiAction {
  assertPaise('amountPaise', input.amountPaise);
  const takenAt = input.now.toISOString();
  return {
    id: input.id,
    membershipId: input.membershipId,
    actionType: input.actionType,
    amountPaise: input.amountPaise,
    takenAt,
    reversibleUntil: new Date(input.now.getTime() + REVERSIBLE_MS).toISOString(),
    authorization: input.via.kind,
    ...(input.via.kind === 'auto' ? { grantId: input.via.grantId } : {}),
    state: 'reversible',
    history: [{ type: 'taken', at: takenAt }],
  };
}

/// Member-initiated undo. Allowed only while `reversible` and within the 24h
/// window; otherwise it throws (a settled or already-reversed action is final).
export function reverseAction(action: RafiqiAction, now: Date): RafiqiAction {
  if (action.state !== 'reversible') {
    throw new Error(`cannot reverse an action in state '${action.state}'`);
  }
  if (now.getTime() >= Date.parse(action.reversibleUntil)) {
    throw new Error('the 24h reversibility window has closed');
  }
  return { ...action, state: 'reversed', history: [...action.history, { type: 'reversed', at: now.toISOString() }] };
}

/// Settle an action once its 24h window has elapsed (pure). A reversed or already
/// settled action is unchanged; a still-in-window action is unchanged.
export function checkReversibility(action: RafiqiAction, now: Date): RafiqiAction {
  if (action.state === 'reversible' && now.getTime() >= Date.parse(action.reversibleUntil)) {
    return { ...action, state: 'settled', history: [...action.history, { type: 'settled', at: now.toISOString() }] };
  }
  return action;
}
