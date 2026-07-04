/// The Floor registry + the server-side accessor (R8; ADR-0017). The registry is
/// the single source of truth for `the_floor`: an APPEND-ONLY list of published
/// versions — publishing never rewrites a version, so the version history is the
/// change-audit trail ("every change versioned and audited"). The accessor
/// (`RegistryFloorSource`) is how services read the Floor server-side; it
/// implements the existing `FloorSource` seam (`floor.ts`), so it drops straight
/// into the wage settlement in place of `InMemoryFloorSource` without touching the
/// route or the allocator.
///
/// The real config-backed store (a Founder-owned, deploy-time source used by all
/// services — ADR-0017) plugs in at `FloorRegistry` later; this in-memory adapter
/// holds the mechanism and the invariants.

import type { FloorSource } from './floor.js';
import { resolveDignityFloor, type FloorVersion } from './the_floor.js';
import { InMemoryDurableStore, type DurableStore } from './durable_store.js';

export interface FloorRegistry {
  /** Append a published version. Must be exactly current+1 (monotonic, append-only). */
  publish(version: FloorVersion): Promise<void>;
  /** The current (highest) version, or undefined if none is published yet. */
  current(): Promise<FloorVersion | undefined>;
  /** A specific version by number (audit/history reads). */
  get(version: number): Promise<FloorVersion | undefined>;
  /** The full version history, oldest first (the audit trail). */
  history(): Promise<readonly FloorVersion[]>;
}

export class InMemoryFloorRegistry implements FloorRegistry {
  readonly #versions: FloorVersion[] = [];

  async publish(version: FloorVersion): Promise<void> {
    const expected = this.#versions.length + 1;
    if (version.version !== expected) {
      // Guard the append-only monotonic invariant: a caller must build the next
      // version from `current()` (createInitialFloor / reviseFloor), never skip or
      // rewrite. Rewriting history would defeat the audit guarantee.
      throw new RangeError(`floor version must be ${expected} (append-only), got ${version.version}`);
    }
    this.#versions.push(version);
  }

  async current(): Promise<FloorVersion | undefined> {
    return this.#versions[this.#versions.length - 1];
  }

  async get(version: number): Promise<FloorVersion | undefined> {
    return this.#versions.find((v) => v.version === version);
  }

  async history(): Promise<readonly FloorVersion[]> {
    return [...this.#versions];
  }
}

/// Durable `FloorRegistry` over any `DurableStore<FloorVersion>` (keyed by version
/// number). The append-only monotonic invariant is enforced the same way — a
/// publish must be exactly the next version — so the audit history survives a
/// restart intact.
export class DurableFloorRegistry implements FloorRegistry {
  readonly #backing: DurableStore<FloorVersion>;
  constructor(backing: DurableStore<FloorVersion> = new InMemoryDurableStore<FloorVersion>()) {
    this.#backing = backing;
  }
  async publish(version: FloorVersion): Promise<void> {
    const expected = (await this.#backing.values()).length + 1;
    if (version.version !== expected) {
      throw new RangeError(`floor version must be ${expected} (append-only), got ${version.version}`);
    }
    await this.#backing.put(String(version.version), version);
  }
  async current(): Promise<FloorVersion | undefined> {
    const all = await this.#backing.values();
    return all.reduce<FloorVersion | undefined>((max, v) => (max === undefined || v.version > max.version ? v : max), undefined);
  }
  async get(version: number): Promise<FloorVersion | undefined> {
    return this.#backing.get(String(version));
  }
  async history(): Promise<readonly FloorVersion[]> {
    return [...(await this.#backing.values())].sort((a, b) => a.version - b.version);
  }
}

/// The server-side Floor accessor. Reads the current published version and
/// resolves the Member's dignity floor (override → baseline). Implements
/// `FloorSource`, so `registerWageSettlementRoutes({ floor: new
/// RegistryFloorSource(registry), ... })` reads the authoritative, versioned Floor
/// — never a client-supplied value (OD-6). Throws if no version is published: a
/// wage settlement must not run without an authoritative Floor.
export class RegistryFloorSource implements FloorSource {
  readonly #registry: FloorRegistry;

  constructor(registry: FloorRegistry) {
    this.#registry = registry;
  }

  async dignityFloorPaise(membershipId: string): Promise<number> {
    const version = await this.#registry.current();
    if (!version) {
      throw new Error('no_floor_published: the authoritative Floor is not configured');
    }
    return resolveDignityFloor(version, membershipId);
  }
}
