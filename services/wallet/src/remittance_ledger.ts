/// Persistence + escalation seams for remittance (R4; ADR-0013). Ports & adapters,
/// like `FloorSource` and `ArrearsLedger`: these RECORD and RETRIEVE — they decide
/// nothing. The state machine (`remittance.ts`) holds all the policy.
///
/// Auditability: remittances are stored and retrievable by remittance id (and
/// filterable by Member); escalations are recorded against the remittance id and
/// carry the funding settlement id. The real append-only ledger plugs in here later.

import { checkSla, type Remittance } from './remittance.js';

export interface RemittanceStore {
  /** Persist a remittance (upsert by id) so its state + history are auditable. */
  save(remittance: Remittance): Promise<void>;
  /** Retrieve by remittance id. */
  get(id: string): Promise<Remittance | undefined>;
  /** All of a Member's remittances, in save order. */
  listForMember(membershipId: string): Promise<readonly Remittance[]>;
  /**
   * The unconfirmed remittances (`initiated`/`in_transit`) — the only ones that
   * can still breach the SLA. The SLA sweep reads these so it never rescans
   * confirmed/settled/escalated records.
   */
  listUnconfirmed(): Promise<readonly Remittance[]>;
}

export class InMemoryRemittanceStore implements RemittanceStore {
  readonly #byId = new Map<string, Remittance>();

  async save(remittance: Remittance): Promise<void> {
    this.#byId.set(remittance.id, remittance);
  }

  async get(id: string): Promise<Remittance | undefined> {
    return this.#byId.get(id);
  }

  async listForMember(membershipId: string): Promise<readonly Remittance[]> {
    return [...this.#byId.values()].filter((r) => r.membershipId === membershipId);
  }

  async listUnconfirmed(): Promise<readonly Remittance[]> {
    return [...this.#byId.values()].filter((r) => r.state === 'initiated' || r.state === 'in_transit');
  }
}

/// The Operator hand-off for a stalled remittance. Auditable by remittance id.
export interface OperatorEscalation {
  readonly remittanceId: string;
  readonly membershipId: string;
  readonly settlementId?: string | undefined;
  readonly reason: 'sla_breached_unconfirmed';
  readonly at: string;
}

export interface OperatorEscalations {
  raise(escalation: OperatorEscalation): Promise<void>;
  listForRemittance(remittanceId: string): Promise<readonly OperatorEscalation[]>;
}

export class InMemoryOperatorEscalations implements OperatorEscalations {
  readonly #byRemittance = new Map<string, OperatorEscalation[]>();

  async raise(escalation: OperatorEscalation): Promise<void> {
    const list = this.#byRemittance.get(escalation.remittanceId) ?? [];
    list.push(escalation);
    this.#byRemittance.set(escalation.remittanceId, list);
  }

  async listForRemittance(remittanceId: string): Promise<readonly OperatorEscalation[]> {
    return [...(this.#byRemittance.get(remittanceId) ?? [])];
  }
}

/// Escalate a remittance if its 24h SLA has breached while unconfirmed (ADR-0013).
/// Applies the pure `checkSla` transition and, ONLY on a fresh escalation, raises
/// the Operator hand-off (keyed by remittance id) and persists the new state.
/// Idempotent: an already-escalated remittance raises nothing again.
export async function escalateIfStalled(
  remittance: Remittance,
  now: Date,
  deps: { readonly operator: OperatorEscalations; readonly store?: RemittanceStore },
): Promise<Remittance> {
  const next = checkSla(remittance, now);
  const freshlyEscalated = next.state === 'escalated' && remittance.state !== 'escalated';
  if (freshlyEscalated) {
    await deps.operator.raise({
      remittanceId: next.id,
      membershipId: next.membershipId,
      settlementId: next.settlementId,
      reason: 'sla_breached_unconfirmed',
      at: now.toISOString(),
    });
    await deps.store?.save(next);
  }
  return next;
}

export interface SlaSweepResult {
  /** How many unconfirmed remittances were examined. */
  readonly scanned: number;
  /** The ids freshly escalated to the Operator this sweep. */
  readonly escalated: readonly string[];
}

/// The scheduled SLA sweep (R4 infra): scan every unconfirmed remittance and
/// escalate the ones whose 24h SLA has breached (ADR-0013). Idempotent — a
/// remittance already escalated is not re-raised (`escalateIfStalled` guards it),
/// so running the sweep repeatedly is safe. The *schedule* is external (an ops
/// scheduler triggers it, e.g. via the service-authed endpoint); this is the pure
/// batch operation over the store.
export async function sweepRemittanceSla(
  now: Date,
  deps: { readonly store: RemittanceStore; readonly operator: OperatorEscalations },
): Promise<SlaSweepResult> {
  const candidates = await deps.store.listUnconfirmed();
  const escalated: string[] = [];
  for (const remittance of candidates) {
    const next = await escalateIfStalled(remittance, now, { operator: deps.operator, store: deps.store });
    if (next.state === 'escalated' && remittance.state !== 'escalated') {
      escalated.push(next.id);
    }
  }
  return { scanned: candidates.length, escalated };
}
