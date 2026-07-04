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

  return {
    host: env.HOST ?? '127.0.0.1',
    port: intEnv(env.PORT, 8081, 'PORT'),
    dataDir: env.NIA_DATA_DIR ?? '.nia-data',
    serviceTokens,
    recoveryCapBps,
    savingsSettleMs: intEnv(env.NIA_SAVINGS_SETTLE_MS, 0, 'NIA_SAVINGS_SETTLE_MS'),
    floorSeed: loadFloorSeed(env.NIA_FLOOR_CONFIG_PATH, readFile),
  };
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
