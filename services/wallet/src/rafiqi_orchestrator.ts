/// RafiQi orchestrator — "RafiQi acts for the Member, but the Member decides"
/// wired end to end (R5 infra; ruling: ADR-0014 / OD-3, locked in
/// /ENGINEERING_LOCK.md).
///
/// The domain (`rafiqi.ts`) holds the policy: authorize (auto vs
/// per-action-confirmation), take (24h reversible), reverse. This module SEQUENCES
/// those against the stores and the money path — it adds NO policy:
///   • AUTO-TAKE: resolve the authorisation from the Member's grants; if an active
///     grant covers it, take the action automatically and apply its money effect;
///     otherwise fall back to per-action confirmation (nothing is taken).
///   • REVERSAL COMPENSATION: reversing within the 24h window (the locked
///     reversibility) undoes the action's money effect through the SAME port.
///
/// The action's money movement — and its inverse on reversal — is the injected
/// `MoneyEffect` seam, NOT invented here: what a `store_swap` (or any actionType)
/// does to money, and therefore how it is undone, belongs to that action's money
/// path. The default `NoMoneyEffect` records nothing until a real path is wired.
/// RafiQi *taking* an action stays the orchestrator boundary (ADR-0004) — there is
/// no Member endpoint for it; RafiQi (the standalone service) drives these.

import { randomUUID } from 'node:crypto';
import { authorizeAction, reverseAction, takeAction, type RafiqiAction } from './rafiqi.js';
import type { GrantStore, RafiqiActionStore } from './rafiqi_ledger.js';

/// The money path a RafiQi action drives. `apply` performs the movement; `reverse`
/// is its exact inverse, invoked when the Member reverses within the 24h window
/// (the locked reversibility). Both are keyed off the action; the concrete money
/// semantics live in the implementation, never in the orchestrator.
export interface MoneyEffect {
  apply(action: RafiqiAction): Promise<void>;
  reverse(action: RafiqiAction): Promise<void>;
}

/// The honest default until a real money path is wired: records nothing. The
/// orchestrator still tracks the action + reversal state; only the money movement
/// is deferred (mirrors the other zero/empty seam defaults).
export class NoMoneyEffect implements MoneyEffect {
  async apply(): Promise<void> {}
  async reverse(): Promise<void> {}
}

export interface OrchestratorDeps {
  readonly grants: GrantStore;
  readonly actions: RafiqiActionStore;
  readonly effect: MoneyEffect;
  readonly now?: () => Date;
  readonly newId?: () => string;
}

export interface ProposedAction {
  readonly membershipId: string;
  readonly actionType: string;
  readonly amountPaise: number;
}

export type AutoTakeResult =
  | { readonly outcome: 'taken'; readonly action: RafiqiAction }
  | { readonly outcome: 'needs_confirmation'; readonly reason: 'no_grant' | 'grant_inactive' | 'over_cap' };

/// Try to take an action automatically. Resolves authorisation from ALL the
/// Member's grants (so the reason is precise), and only takes it when an active
/// grant covers it — otherwise returns `needs_confirmation` and takes NOTHING
/// (the per-action-confirmation fallback; the caller prompts the Member, then uses
/// `confirmedTake`).
export async function autoTake(proposal: ProposedAction, deps: OrchestratorDeps): Promise<AutoTakeResult> {
  const now = (deps.now ?? (() => new Date()))();
  const grants = await deps.grants.listForMember(proposal.membershipId);
  const decision = authorizeAction({ actionType: proposal.actionType, amountPaise: proposal.amountPaise }, grants, now);
  if (decision.outcome === 'needs_confirmation') {
    return { outcome: 'needs_confirmation', reason: decision.reason };
  }
  const action = await take(proposal, { kind: 'auto', grantId: decision.grantId }, now, deps);
  return { outcome: 'taken', action };
}

/// Take an action the Member explicitly confirmed (after a `needs_confirmation`).
export async function confirmedTake(proposal: ProposedAction, deps: OrchestratorDeps): Promise<RafiqiAction> {
  const now = (deps.now ?? (() => new Date()))();
  return take(proposal, { kind: 'confirmed' }, now, deps);
}

async function take(
  proposal: ProposedAction,
  via: { readonly kind: 'auto'; readonly grantId: string } | { readonly kind: 'confirmed' },
  now: Date,
  deps: OrchestratorDeps,
): Promise<RafiqiAction> {
  const newId = deps.newId ?? (() => randomUUID());
  const action = takeAction({
    id: newId(),
    membershipId: proposal.membershipId,
    actionType: proposal.actionType,
    amountPaise: proposal.amountPaise,
    now,
    via,
  });
  await deps.actions.save(action);
  await deps.effect.apply(action); // the money movement happens after the action is recorded.
  return action;
}

/// Reverse an action within its 24h window and COMPENSATE the money path. The
/// domain `reverseAction` enforces the window (throws once closed or already
/// reversed/settled); on success the action is persisted reversed and the money
/// effect is undone. Throws if there is no such action.
export async function reverseWithCompensation(actionId: string, deps: OrchestratorDeps): Promise<RafiqiAction> {
  const now = (deps.now ?? (() => new Date()))();
  const action = await deps.actions.get(actionId);
  if (!action) throw new Error(`no such RafiQi action ${actionId}`);
  const reversed = reverseAction(action, now); // guards the reversibility window (ADR-0014).
  await deps.actions.save(reversed);
  await deps.effect.reverse(action); // undo the money movement — the inverse of apply.
  return reversed;
}
