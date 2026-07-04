/// Durable persistence primitive (infra). The service's bespoke stores
/// (`RemittanceStore`, `SavingsAccountStore`, …) are ports; their in-memory
/// adapters lose state on restart. This is the DURABLE backing they compose over:
/// a small keyed `DurableStore<T>` interface plus two implementations —
/// `InMemoryDurableStore` (tests/parity) and `FileDurableStore` (a real,
/// dependency-free snapshot store that survives process restart).
///
/// The PRODUCTION durable adapter is PostgreSQL (ADR-0006); it implements this
/// same `DurableStore<T>` interface, so composing the bespoke stores over the
/// interface — not a concrete backing — is what lets Postgres drop in later
/// without touching the domain. `FileDurableStore` is the offline reference impl
/// (no DB, no new dependency), genuinely durable but single-process.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export interface DurableStore<T> {
  get(id: string): Promise<T | undefined>;
  put(id: string, value: T): Promise<void>;
  delete(id: string): Promise<void>;
  /** Every stored value, in insertion order (a scan for the bespoke list queries). */
  values(): Promise<readonly T[]>;
}

/// In-memory backing — no durability, for tests and for composing bespoke stores
/// without touching the disk. Insertion order preserved (Map semantics).
export class InMemoryDurableStore<T> implements DurableStore<T> {
  readonly #byId = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.#byId.get(id);
  }

  async put(id: string, value: T): Promise<void> {
    this.#byId.set(id, value);
  }

  async delete(id: string): Promise<void> {
    this.#byId.delete(id);
  }

  async values(): Promise<readonly T[]> {
    return [...this.#byId.values()];
  }
}

/// A durable snapshot store: the whole keyed map is persisted to one JSON file and
/// reloaded on construction, so a fresh instance over the same path sees prior
/// state (survives restart). Writes are ATOMIC — a temp file is renamed over the
/// target — so a crash mid-write never truncates the store. Single-process (no
/// cross-process locking); the Postgres adapter (ADR-0006) is the multi-writer
/// production path. Values must be JSON-serialisable (the domain records are).
export class FileDurableStore<T> implements DurableStore<T> {
  readonly #path: string;
  readonly #byId: Map<string, T>;

  constructor(path: string) {
    this.#path = path;
    this.#byId = new Map(existsSync(path) ? Object.entries(JSON.parse(readFileSync(path, 'utf8')) as Record<string, T>) : []);
  }

  async get(id: string): Promise<T | undefined> {
    return this.#byId.get(id);
  }

  async put(id: string, value: T): Promise<void> {
    this.#byId.set(id, value);
    this.#flush();
  }

  async delete(id: string): Promise<void> {
    if (this.#byId.delete(id)) this.#flush();
  }

  async values(): Promise<readonly T[]> {
    return [...this.#byId.values()];
  }

  #flush(): void {
    const dir = dirname(this.#path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const snapshot = JSON.stringify(Object.fromEntries(this.#byId));
    const tmp = `${this.#path}.tmp`;
    writeFileSync(tmp, snapshot, 'utf8');
    renameSync(tmp, this.#path); // atomic replace
  }
}
