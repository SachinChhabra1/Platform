/// Offline write reconciliation — the domain for "resolve a queued offline write
/// against server state" (R6; ruling: ADR-0015 / OD-4, locked in
/// /ENGINEERING_LOCK.md).
///
/// Resolution is PER RECORD CLASS (the locked Option C):
///   • money       → server-authoritative-with-reconciliation. An offline money
///                   write is a PROPOSAL, applied only if the server has not
///                   diverged from the client's base; a genuine conflict surfaces
///                   to the Operator and is NEVER silently overwritten.
///   • intent      → last-write-wins (the Member's latest preference stands).
///   • append_only → merge (union by id; an immutable fact is deduped).
///
/// Policy lives here; the stores/queue (below) only record. This layer reconciles
/// records — it never interprets the opaque payload (money amounts included).
/// Independent of arrears/OD-7.
///
/// NOTE (bounded context): co-located in the wallet money domain (the offline dev
/// sandbox cannot add a new pnpm workspace member). Extract to `services/edge`
/// (the sync boundary) when online.

import { randomUUID } from 'node:crypto';

export type RecordClass = 'money' | 'intent' | 'append_only';

export interface SyncRecord {
  readonly id: string;
  readonly recordClass: RecordClass;
  /** Version/updated-at, used for divergence (money) and last-write-wins (intent). */
  readonly updatedAt: string;
  readonly payload: unknown;
}

export interface OfflineWrite {
  readonly record: SyncRecord;
  /** The server version the client last saw (its base). Absent = no server base. */
  readonly baseUpdatedAt?: string | undefined;
}

export type ReconcileOutcome = 'applied' | 'kept_server' | 'merged' | 'conflict_operator';

export interface ReconcileResult {
  readonly outcome: ReconcileOutcome;
  /** What the server should hold after reconciliation; undefined = leave server unchanged. */
  readonly persist?: SyncRecord | undefined;
}

/// Reconcile one offline write against the current server record (or its absence),
/// per the record class. Pure — no clock, no I/O.
export function reconcile(write: OfflineWrite, server: SyncRecord | undefined): ReconcileResult {
  const { record } = write;

  switch (record.recordClass) {
    case 'append_only':
      // Union by id: an immutable fact. If the server already has it, dedup (keep
      // server, no write); otherwise add it. Never a conflict.
      return server === undefined ? { outcome: 'merged', persist: record } : { outcome: 'merged' };

    case 'intent': {
      // Last-write-wins: the later updatedAt stands. Ties go to the incoming write
      // (the Member just acted).
      if (server === undefined || record.updatedAt >= server.updatedAt) {
        return { outcome: 'applied', persist: record };
      }
      return { outcome: 'kept_server' };
    }

    case 'money': {
      // Server-authoritative-with-reconciliation. A money write is a proposal:
      //  - no server record yet → nothing to conflict with, apply the proposal.
      //  - server present AND unchanged from the client's base → apply.
      //  - otherwise (server diverged, or no known base) → CONFLICT to the
      //    Operator; the server is never silently overwritten.
      if (server === undefined) return { outcome: 'applied', persist: record };
      if (write.baseUpdatedAt !== undefined && write.baseUpdatedAt === server.updatedAt) {
        return { outcome: 'applied', persist: record };
      }
      return { outcome: 'conflict_operator' };
    }
  }
}

// --- Seams: server store + the Operator reconciliation queue ---------------

export interface SyncStore {
  get(id: string): Promise<SyncRecord | undefined>;
  put(record: SyncRecord): Promise<void>;
}

export class InMemorySyncStore implements SyncStore {
  readonly #byId = new Map<string, SyncRecord>();
  constructor(seed: readonly SyncRecord[] = []) {
    for (const r of seed) this.#byId.set(r.id, r);
  }
  async get(id: string): Promise<SyncRecord | undefined> {
    return this.#byId.get(id);
  }
  async put(record: SyncRecord): Promise<void> {
    this.#byId.set(record.id, record);
  }
}

/// How the Operator resolved a money conflict (OD-8 / ADR-0019).
export type ResolutionChoice = 'accept_proposal' | 'keep_server' | 'manual';

/// The audited resolution of a conflict: the choice, the deciding operator, the
/// reason, when, and whether it produced a server write (keep-server does not).
export interface ConflictResolution {
  readonly choice: ResolutionChoice;
  readonly operatorId: string;
  readonly reason: string;
  readonly resolvedAt: string;
  readonly persisted: boolean;
}

/// A money conflict handed to the Operator (never lost, ADR-0015). Carries the
/// full `proposed` record so the Operator can accept it, and a lifecycle
/// (`pending → resolved`) with the audited `resolution` once worked (OD-8).
export interface ReconciliationItem {
  readonly id: string;
  readonly recordId: string;
  readonly recordClass: 'money';
  /** The client's proposed write (needed to accept-proposal). */
  readonly proposed: SyncRecord;
  /** The diverged server version at conflict time (display/audit). */
  readonly serverUpdatedAt?: string | undefined;
  readonly at: string;
  readonly status: 'pending' | 'resolved';
  readonly resolution?: ConflictResolution | undefined;
}

export interface ResolveDecision {
  readonly choice: ResolutionChoice;
  readonly operatorId: string;
  readonly reason: string;
  readonly now: Date;
  /** The corrected authoritative payload — REQUIRED for and only used by `manual`. */
  readonly manualPayload?: unknown;
}

export interface ResolveResult {
  /** The authoritative record to write (undefined for keep-server — server stands). */
  readonly persist?: SyncRecord | undefined;
  readonly item: ReconciliationItem;
}

/// Resolve a pending money conflict per the Operator's decision (OD-8 / ADR-0019,
/// pure). Produces the authoritative record to persist (except keep-server) and
/// the resolved item carrying the audit trail. Throws if the item is already
/// resolved, or if `manual` is chosen without a corrected payload.
export function resolveConflict(item: ReconciliationItem, decision: ResolveDecision): ResolveResult {
  if (item.status !== 'pending') {
    throw new Error(`conflict ${item.id} is already resolved`);
  }
  const resolvedAt = decision.now.toISOString();
  let persist: SyncRecord | undefined;
  switch (decision.choice) {
    case 'accept_proposal':
      // The client's offline write becomes authoritative, as a fresh server version.
      persist = { id: item.recordId, recordClass: 'money', updatedAt: resolvedAt, payload: item.proposed.payload };
      break;
    case 'manual':
      if (decision.manualPayload === undefined) {
        throw new Error('a manual resolution requires a corrected payload');
      }
      persist = { id: item.recordId, recordClass: 'money', updatedAt: resolvedAt, payload: decision.manualPayload };
      break;
    case 'keep_server':
      persist = undefined; // the server value stands; no write.
      break;
  }
  const resolution: ConflictResolution = {
    choice: decision.choice,
    operatorId: decision.operatorId,
    reason: decision.reason,
    resolvedAt,
    persisted: persist !== undefined,
  };
  return { persist, item: { ...item, status: 'resolved', resolution } };
}

export interface ReconciliationQueue {
  enqueue(item: ReconciliationItem): Promise<void>;
  listForRecord(recordId: string): Promise<readonly ReconciliationItem[]>;
  /**
   * Every PENDING money conflict, oldest-first — the Operator reconciliation
   * surface reads this so a conflict is visibly "never lost" (ADR-0015). Resolved
   * items drop out (OD-8).
   */
  listPending(): Promise<readonly ReconciliationItem[]>;
  /** One item by its id (the resolve target). */
  get(id: string): Promise<ReconciliationItem | undefined>;
  /** Upsert an item (used to record a resolution). */
  save(item: ReconciliationItem): Promise<void>;
}

export class InMemoryReconciliationQueue implements ReconciliationQueue {
  // Insertion-ordered by id (Map preserves order → listPending is oldest-first).
  readonly #byId = new Map<string, ReconciliationItem>();

  async enqueue(item: ReconciliationItem): Promise<void> {
    this.#byId.set(item.id, item);
  }
  async listForRecord(recordId: string): Promise<readonly ReconciliationItem[]> {
    return [...this.#byId.values()].filter((i) => i.recordId === recordId);
  }
  async listPending(): Promise<readonly ReconciliationItem[]> {
    return [...this.#byId.values()].filter((i) => i.status === 'pending');
  }
  async get(id: string): Promise<ReconciliationItem | undefined> {
    return this.#byId.get(id);
  }
  async save(item: ReconciliationItem): Promise<void> {
    this.#byId.set(item.id, item);
  }
}

/// Apply one offline write: reconcile it, persist the result if any, and queue a
/// money conflict to the Operator (never overwriting the server). Returns the
/// outcome for the client. `newId` stamps a stable id on a queued conflict.
export async function applyOfflineWrite(
  write: OfflineWrite,
  now: Date,
  deps: { readonly store: SyncStore; readonly operator: ReconciliationQueue; readonly newId?: () => string },
): Promise<ReconcileOutcome> {
  const server = await deps.store.get(write.record.id);
  const result = reconcile(write, server);
  if (result.persist !== undefined) await deps.store.put(result.persist);
  if (result.outcome === 'conflict_operator') {
    const newId = deps.newId ?? (() => randomUUID());
    await deps.operator.enqueue({
      id: newId(),
      recordId: write.record.id,
      recordClass: 'money',
      proposed: write.record,
      ...(server !== undefined ? { serverUpdatedAt: server.updatedAt } : {}),
      at: now.toISOString(),
      status: 'pending',
    });
  }
  return result.outcome;
}
