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

/// A money conflict handed to the Operator (never lost). Keyed by record id.
export interface ReconciliationItem {
  readonly recordId: string;
  readonly recordClass: 'money';
  readonly proposedUpdatedAt: string;
  readonly serverUpdatedAt?: string | undefined;
  readonly at: string;
}

export interface ReconciliationQueue {
  enqueue(item: ReconciliationItem): Promise<void>;
  listForRecord(recordId: string): Promise<readonly ReconciliationItem[]>;
}

export class InMemoryReconciliationQueue implements ReconciliationQueue {
  readonly #byRecord = new Map<string, ReconciliationItem[]>();
  async enqueue(item: ReconciliationItem): Promise<void> {
    const list = this.#byRecord.get(item.recordId) ?? [];
    list.push(item);
    this.#byRecord.set(item.recordId, list);
  }
  async listForRecord(recordId: string): Promise<readonly ReconciliationItem[]> {
    return [...(this.#byRecord.get(recordId) ?? [])];
  }
}

/// Apply one offline write: reconcile it, persist the result if any, and queue a
/// money conflict to the Operator (never overwriting the server). Returns the
/// outcome for the client.
export async function applyOfflineWrite(
  write: OfflineWrite,
  now: Date,
  deps: { readonly store: SyncStore; readonly operator: ReconciliationQueue },
): Promise<ReconcileOutcome> {
  const server = await deps.store.get(write.record.id);
  const result = reconcile(write, server);
  if (result.persist !== undefined) await deps.store.put(result.persist);
  if (result.outcome === 'conflict_operator') {
    await deps.operator.enqueue({
      recordId: write.record.id,
      recordClass: 'money',
      proposedUpdatedAt: write.record.updatedAt,
      ...(server !== undefined ? { serverUpdatedAt: server.updatedAt } : {}),
      at: now.toISOString(),
    });
  }
  return result.outcome;
}
