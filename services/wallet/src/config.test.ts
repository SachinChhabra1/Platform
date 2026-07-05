import { describe, expect, it } from 'vitest';
import { loadWalletConfig } from './config.js';

const FLOOR_JSON = JSON.stringify({
  values: { dignityFloorPaise: 2000, settlementFloorPaise: 10000, womenDignityFloorPaise: 3000, overridesByMember: { 'm-woman': 3000 } },
  author: 'founder',
  note: 'initial floor',
});

describe('loadWalletConfig — honest-empty defaults, no invented value', () => {
  it('defaults everything safely when the env is empty', () => {
    const c = loadWalletConfig({});
    expect(c).toMatchObject({
      host: '127.0.0.1',
      port: 8081,
      dataDir: '.nia-data',
      serviceTokens: [],
      recoveryCapBps: 0, // recovery OFF until deploy sets it
      savingsSettleMs: 0, // T+0 until set
    });
    expect(c.floorSeed).toBeUndefined(); // no floor → registry stays empty
    expect(c.operatorCredentials).toEqual({}); // no operators → resolution denies all
    expect(c.memberDirectory).toEqual({}); // no directory → login denies all
    expect(c.store).toBe('file'); // file-backed by default
    expect(c.databaseUrl).toBeUndefined();
  });

  it('selects the Postgres backing and reads the connection string from the env', () => {
    const c = loadWalletConfig({ NIA_STORE: 'postgres', DATABASE_URL: 'postgres://h/db' });
    expect(c.store).toBe('postgres');
    expect(c.databaseUrl).toBe('postgres://h/db');
  });

  it('accepts postgres with no URL (node-postgres reads PG* itself)', () => {
    expect(loadWalletConfig({ NIA_STORE: 'postgres' }).databaseUrl).toBeUndefined();
  });

  it('rejects an unknown store backing', () => {
    expect(() => loadWalletConfig({ NIA_STORE: 'sqlite' })).toThrow(/NIA_STORE/);
  });

  it('loads operator credentials from a config file', () => {
    const c = loadWalletConfig({ NIA_OPERATOR_CONFIG_PATH: '/ops.json' }, () => JSON.stringify({ 'cred-1': 'op-neha' }));
    expect(c.operatorCredentials).toEqual({ 'cred-1': 'op-neha' });
  });

  it('loads the member phone directory from a config file (login provisioning)', () => {
    const c = loadWalletConfig({ NIA_MEMBER_DIRECTORY_CONFIG_PATH: '/dir.json' }, () => JSON.stringify({ '+919000000001': 'm-1' }));
    expect(c.memberDirectory).toEqual({ '+919000000001': 'm-1' });
  });

  it('rejects a malformed member directory', () => {
    expect(() => loadWalletConfig({ NIA_MEMBER_DIRECTORY_CONFIG_PATH: '/dir.json' }, () => JSON.stringify({ '+91900': 123 }))).toThrow(/member directory/);
  });

  it('parses service tokens (trimmed, blanks dropped)', () => {
    expect(loadWalletConfig({ NIA_SERVICE_TOKENS: ' a , ,b ,' }).serviceTokens).toEqual(['a', 'b']);
  });

  it('reads the ruled recovery cap and settlement horizon from the env', () => {
    const c = loadWalletConfig({ NIA_RECOVERY_CAP_BPS: '5000', NIA_SAVINGS_SETTLE_MS: '172800000' });
    expect(c.recoveryCapBps).toBe(5000);
    expect(c.savingsSettleMs).toBe(172_800_000);
  });

  it('rejects an out-of-range or non-integer cap', () => {
    expect(() => loadWalletConfig({ NIA_RECOVERY_CAP_BPS: '10001' })).toThrow();
    expect(() => loadWalletConfig({ NIA_RECOVERY_CAP_BPS: '-1' })).toThrow();
    expect(() => loadWalletConfig({ NIA_RECOVERY_CAP_BPS: '1.5' })).toThrow();
  });

  it('loads the Founder Floor seed from a config file (values come from the file)', () => {
    const c = loadWalletConfig({ NIA_FLOOR_CONFIG_PATH: '/etc/nia/floor.json' }, () => FLOOR_JSON);
    expect(c.floorSeed?.values.dignityFloorPaise).toBe(2000);
    expect(c.floorSeed?.values.overridesByMember).toEqual({ 'm-woman': 3000 });
    expect(c.floorSeed?.author).toBe('founder');
  });

  it('rejects a floor config missing a required value or provenance', () => {
    expect(() => loadWalletConfig({ NIA_FLOOR_CONFIG_PATH: '/f.json' }, () => JSON.stringify({ values: { dignityFloorPaise: 2000 }, author: 'f', note: 'n' }))).toThrow();
    expect(() => loadWalletConfig({ NIA_FLOOR_CONFIG_PATH: '/f.json' }, () => JSON.stringify({ values: { dignityFloorPaise: 2000, settlementFloorPaise: 1, womenDignityFloorPaise: 1 } }))).toThrow(/author/);
  });
});
