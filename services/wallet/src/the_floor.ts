/// The Floor — the authoritative, versioned, Founder-owned dignity guarantees
/// (R8; ruling: ADR-0017 / OD-6, Option B, locked in /ENGINEERING_LOCK.md).
///
/// "One Floor for everyone." The Floor's *source and access mechanism* are the
/// architectural, hard-to-reverse part (this file); its *contents* are meant to
/// evolve, so every change publishes a NEW version and the version history IS the
/// change-audit trail. Locked rules:
///  1. There is ONE authoritative Floor, versioned; a change never rewrites a
///     version — it appends a new one (`reviseFloor`), carrying who/when/why.
///  2. The Floor is read-only to the app and resolved SERVER-SIDE for services
///     (the accessor + `RegistryFloorSource`, `the_floor_registry.ts`).
///
/// This file builds the MECHANISM only. It invents NO Floor value — every paise
/// figure is supplied by the Founder (production) or an explicit test fixture. The
/// structured contents follow ADR-0017: dignity minimums, settlement floors, and
/// the FD-11 higher floor for women Members.
///
/// NOTE (bounded context): co-located in the wallet money domain (the offline dev
/// sandbox cannot add a new pnpm workspace member). Extract to a shared `@nia/floor`
/// config library (ADR-0017: "used by all services") when online.

function assertPaise(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer paise value, got ${value}`);
  }
}

/// The Floor's contents. The first three fields are PUBLIC guarantees (surfaced
/// read-only to the app). `overridesByMember` is the SERVER-SIDE per-Member
/// resolution (how a higher floor — e.g. FD-11 for a woman Member — actually
/// attaches to a Member); it is never exposed by the read-only endpoint.
export interface FloorValues {
  /** Baseline protected minimum take-home per cycle (OD-1's dignity floor), in paise. */
  readonly dignityFloorPaise: number;
  /** Minimum owed on membership off-boarding, in paise. */
  readonly settlementFloorPaise: number;
  /** The FD-11 higher dignity floor guaranteed to women Members, in paise. */
  readonly womenDignityFloorPaise: number;
  /** Founder-assigned per-Member floors (server-side; e.g. the FD-11 floor attached to a Member). */
  readonly overridesByMember: Readonly<Record<string, number>>;
}

function assertValues(values: FloorValues): void {
  assertPaise('dignityFloorPaise', values.dignityFloorPaise);
  assertPaise('settlementFloorPaise', values.settlementFloorPaise);
  assertPaise('womenDignityFloorPaise', values.womenDignityFloorPaise);
  for (const [member, paise] of Object.entries(values.overridesByMember)) {
    assertPaise(`overridesByMember[${member}]`, paise);
  }
}

/// One published version of the Floor. Immutable. The provenance fields
/// (`author`, `note`, `publishedAt`, `supersedesVersion`) are the audit record.
export interface FloorVersion {
  /** Monotonic version number, starting at 1. */
  readonly version: number;
  readonly values: FloorValues;
  /** When this version takes effect / was published. */
  readonly publishedAt: string;
  /** Who published it (Founder-owned change). */
  readonly author: string;
  /** Why it changed — the human-readable audit note. */
  readonly note: string;
  /** The version this one supersedes (absent on the first version). */
  readonly supersedesVersion?: number | undefined;
}

export interface PublishInput {
  readonly values: FloorValues;
  readonly author: string;
  readonly note: string;
  readonly now: Date;
}

/// The first Floor version. Values come from the caller (Founder/fixture), never
/// invented here.
export function createInitialFloor(input: PublishInput): FloorVersion {
  assertValues(input.values);
  return {
    version: 1,
    values: freezeValues(input.values),
    publishedAt: input.now.toISOString(),
    author: input.author,
    note: input.note,
  };
}

/// Publish a revision — a NEW version (current.version + 1) that supersedes the
/// current one. The current version is left untouched (history is append-only);
/// this returns the new version to be appended to the registry.
export function reviseFloor(current: FloorVersion, input: PublishInput): FloorVersion {
  assertValues(input.values);
  return {
    version: current.version + 1,
    values: freezeValues(input.values),
    publishedAt: input.now.toISOString(),
    author: input.author,
    note: input.note,
    supersedesVersion: current.version,
  };
}

/// Resolve a Member's dignity floor from a version: the Member's server-side
/// override if the Founder assigned one, else the baseline. This is the value the
/// wage settlement reads through the seam (OD-1); it is never client-supplied.
export function resolveDignityFloor(version: FloorVersion, membershipId: string): number {
  return version.values.overridesByMember[membershipId] ?? version.values.dignityFloorPaise;
}

function freezeValues(values: FloorValues): FloorValues {
  return { ...values, overridesByMember: { ...values.overridesByMember } };
}
