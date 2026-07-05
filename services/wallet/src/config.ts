/// Production configuration for the wallet service (infra). Every Founder/ops-owned
/// value the seams need is READ here from the environment — never invented in code.
/// Where a value is unset, the config carries the honest-empty default and the
/// seam degrades safely:
///   • no service secret   → the rail/ops surfaces deny everything.
///   • recovery cap unset   → 0, i.e. arrears recovery is OFF (the ruled 50% is a
///                            deploy-set value: NIA_RECOVERY_CAP_BPS=5000).
///   • savings horizon unset→ T+0 (settlement timing is tunable, ADR-0016).
///   • no floor config      → the Floor registry starts EMPTY and a wage
///                            settlement refuses to run (never a fabricated floor).
///
/// The interest RATE/formula is deliberately NOT config-derived here: a concrete
/// policy is a formula choice the Founder has not yet specified, so production uses
/// the zero-yield `NoInterestAccrualPolicy` until that lands (never an invented rate).

import { readFileSync } from 'node:fs';
import type { FloorValues } from './the_floor.js';

/** The Founder-owned seed for the Floor's first version (loaded from a config file). */
export interface FloorSeed {
  readonly values: FloorValues;
  readonly author: string;
  readonly note: string;
}

export interface WalletConfig {
  readonly host: string;
  readonly port: number;
  /** Durable-store backing: 'file' (offline reference persistence) or 'postgres'
   *  (production, ADR-0006). Deploy config, not a product value. */
  readonly store: 'file' | 'postgres';
  /** Postgres connection string when store='postgres'; empty ⇒ node-postgres reads
   *  the PG* env vars itself. Never a product value. */
  readonly databaseUrl?: string | undefined;
  /** Directory for the file-backed durable stores (offline reference persistence). */
  readonly dataDir: string;
  /** Service secrets for the rail/ops surfaces (empty ⇒ deny all). */
  readonly serviceTokens: readonly string[];
  /** OD-7 arrears-recovery cap in basis points (0 ⇒ recovery off; ruled value 5000). */
  readonly recoveryCapBps: number;
  /** Savings T+n settlement horizon in ms (0 ⇒ T+0). */
  readonly savingsSettleMs: number;
  /** The Founder-owned Floor seed, if a config file was provided (else the registry stays empty). */
  readonly floorSeed?: FloorSeed | undefined;
  /** Per-operator credentials (credential → operatorId) for conflict resolution (OD-8); empty ⇒ deny. */
  readonly operatorCredentials: Readonly<Record<string, string>>;
  /** Provisioned phone → membershipId directory for session issuance (login);
   *  empty ⇒ no phone is recognised (issuance denies all). Ops/UAT-owned, not a
   *  product value. */
  readonly memberDirectory: Readonly<Record<string, string>>;
}

/** A thin fs reader, injectable so the loader is testable without touching disk. */
export type FileReader = (path: string) => string;

function intEnv(raw: string | undefined, fallback: number, name: string): number {
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`${name} must be a non-negative integer, got ${JSON.stringify(raw)}`);
  }
  return n;
}

/// Load the wallet config from an environment map (pure — no direct `process.env`,
/// no invented value). `readFile` defaults to `readFileSync` but is injectable.
export function loadWalletConfig(
  env: Readonly<Record<string, string | undefined>>,
  readFile: FileReader = (p) => readFileSync(p, 'utf8'),
): WalletConfig {
  const serviceTokens = (env.NIA_SERVICE_TOKENS ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const recoveryCapBps = intEnv(env.NIA_RECOVERY_CAP_BPS, 0, 'NIA_RECOVERY_CAP_BPS');
  if (recoveryCapBps > 10_000) {
    throw new RangeError(`NIA_RECOVERY_CAP_BPS must be ≤ 10000, got ${recoveryCapBps}`);
  }

  const store = (env.NIA_STORE ?? 'file').trim();
  if (store !== 'file' && store !== 'postgres') {
    throw new RangeError(`NIA_STORE must be 'file' or 'postgres', got ${JSON.stringify(store)}`);
  }
  const databaseUrl = env.DATABASE_URL ?? env.NIA_DATABASE_URL ?? undefined;

  return {
    host: env.HOST ?? '127.0.0.1',
    port: intEnv(env.PORT, 8081, 'PORT'),
    store,
    databaseUrl: databaseUrl === '' ? undefined : databaseUrl,
    dataDir: env.NIA_DATA_DIR ?? '.nia-data',
    serviceTokens,
    recoveryCapBps,
    savingsSettleMs: intEnv(env.NIA_SAVINGS_SETTLE_MS, 0, 'NIA_SAVINGS_SETTLE_MS'),
    floorSeed: loadFloorSeed(env.NIA_FLOOR_CONFIG_PATH, readFile),
    operatorCredentials: loadOperatorCredentials(env.NIA_OPERATOR_CONFIG_PATH, readFile),
    memberDirectory: loadStringMap(env.NIA_MEMBER_DIRECTORY_CONFIG_PATH, readFile, 'member directory', 'phone → membershipId'),
  };
}

/// Load the per-operator credential directory (credential → operatorId) from a
/// JSON file, if configured. No path ⇒ empty ⇒ conflict resolution denies all
/// (operators must be provisioned). Values are ops-owned, never invented.
function loadOperatorCredentials(path: string | undefined, readFile: FileReader): Readonly<Record<string, string>> {
  return loadStringMap(path, readFile, 'operator config', 'credential → operatorId');
}

/// Load a provisioned `string → string` directory from a JSON file, if configured
/// (operator credentials, the member phone directory). No path ⇒ empty ⇒ the seam
/// denies all (must be provisioned). Shape-validated; values ops-owned, never
/// invented. `label`/`shape` name the map in the error messages.
function loadStringMap(
  path: string | undefined,
  readFile: FileReader,
  label: string,
  shape: string,
): Readonly<Record<string, string>> {
  if (path === undefined || path === '') return {};
  const parsed = JSON.parse(readFile(path)) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new RangeError(`${label} must be a JSON object of ${shape}`);
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value !== 'string' || value.length === 0 || key.length === 0) {
      throw new RangeError(`${label} entries must be non-empty ${shape} strings`);
    }
  }
  return { ...(parsed as Record<string, string>) };
}

/// Load the Founder-owned Floor seed from a JSON file, if configured. The file
/// supplies EVERY floor value (dignity/settlement/women floors + any per-Member
/// overrides) — this loader validates shape but invents nothing. No path ⇒ no
/// seed ⇒ the registry stays empty (a wage settlement will refuse to run).
function loadFloorSeed(path: string | undefined, readFile: FileReader): FloorSeed | undefined {
  if (path === undefined || path === '') return undefined;
  const parsed = JSON.parse(readFile(path)) as {
    values?: Partial<FloorValues>;
    author?: unknown;
    note?: unknown;
  };
  const v = parsed.values ?? {};
  for (const key of ['dignityFloorPaise', 'settlementFloorPaise', 'womenDignityFloorPaise'] as const) {
    if (typeof v[key] !== 'number' || !Number.isInteger(v[key]) || (v[key] as number) < 0) {
      throw new RangeError(`floor config '${key}' must be a non-negative integer paise value`);
    }
  }
  if (typeof parsed.author !== 'string' || typeof parsed.note !== 'string') {
    throw new RangeError("floor config must carry string 'author' and 'note' (audit provenance)");
  }
  return {
    values: {
      dignityFloorPaise: v.dignityFloorPaise as number,
      settlementFloorPaise: v.settlementFloorPaise as number,
      womenDignityFloorPaise: v.womenDignityFloorPaise as number,
      overridesByMember: { ...(v.overridesByMember ?? {}) },
    },
    author: parsed.author,
    note: parsed.note,
  };
}
