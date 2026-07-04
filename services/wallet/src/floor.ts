/// FloorSource — the seam through which Wage Flow (and later flows) read the
/// Member's dignity floor.
///
/// The dignity floor is ALWAYS server-side and is NEVER read from a client
/// request — that is the whole point of OD-6 (a client must not be able to lower
/// their own floor). The AUTHORITATIVE floor is the versioned, Founder-owned,
/// audited `the_floor` config (ADR-0017 / OD-6), which is deliberately NOT built
/// yet. This port lets R3 proceed now: the endpoint depends only on this
/// interface, so the concrete config plugs into the seam later without touching
/// the route or the allocator.

export interface FloorSource {
  /**
   * The Member's protected minimum take-home cash this cycle, in integer paise.
   * Resolved server-side; the caller passes only the membership id.
   */
  dignityFloorPaise(membershipId: string): Promise<number> | number;
}

/// A minimal in-memory seam for wiring and tests. It holds NO authoritative
/// policy — every value is supplied by whoever constructs it. It is NOT the
/// `the_floor` config (no versioning, no audit, no Founder ownership); those
/// arrive with ADR-0017 and will replace this at the seam.
export class InMemoryFloorSource implements FloorSource {
  readonly #default: number;
  readonly #byMember: Readonly<Record<string, number>>;

  constructor(opts: { default: number; byMember?: Record<string, number> }) {
    this.#default = opts.default;
    this.#byMember = { ...(opts.byMember ?? {}) };
  }

  dignityFloorPaise(membershipId: string): number {
    return this.#byMember[membershipId] ?? this.#default;
  }
}
