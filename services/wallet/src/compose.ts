/// Production composition root for the wallet service (infra). Assembles the whole
/// HTTP surface — Member routes, the rail webhooks, the ops/scheduler triggers,
/// and the read-only Operator reconciliation surface — over durable stores and the
/// Founder-owned config SEAMS, wiring each config value from `WalletConfig`.
///
/// It invents no product value: the Floor comes from the config seed (or the
/// registry stays empty and wage settlement refuses to run), the recovery cap and
/// settlement horizon come from config, service auth comes from the configured
/// secret(s), and interest uses the zero-yield policy until a Founder rate lands.
/// Shared store instances are threaded so the surfaces cohere (a conflict the sync
/// route queues is what the ops reconciliation surface reads; a remittance the
/// Member initiates is what the rail advances and the sweep escalates).
///
/// Session issuance is a separate slice, so `sessions` is injected (default empty).

import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { createServer, InMemorySessionStore, type SessionStore } from '@nia/runtime';
import type { WalletConfig } from './config.js';
import { FileDurableStore } from './durable_store.js';
import { InMemoryWalletActivitySource } from './source.js';
import { registerWalletOverviewRoutes } from './http.js';
import { InMemoryFloorRegistry, RegistryFloorSource } from './the_floor_registry.js';
import { createInitialFloor } from './the_floor.js';
import { registerFloorRoutes } from './floor_http.js';
import { InMemoryArrearsLedger } from './arrears.js';
import { registerWageSettlementRoutes } from './wage_http.js';
import { NoInterestAccrualPolicy } from './savings.js';
import { InMemorySavingsAccountStore, InMemoryWithdrawalStore } from './savings_ledger.js';
import { registerSavingsRoutes } from './savings_http.js';
import { DurableRemittanceStore, InMemoryOperatorEscalations } from './remittance_ledger.js';
import type { Remittance } from './remittance.js';
import { registerRemittanceRoutes } from './remittance_http.js';
import { registerRemittanceRailRoutes } from './rail_http.js';
import { InMemoryGrantStore, InMemoryRafiqiActionStore } from './rafiqi_ledger.js';
import { registerRafiqiRoutes } from './rafiqi_http.js';
import { InMemorySyncStore, InMemoryReconciliationQueue } from './offline_sync.js';
import { registerSyncRoutes } from './sync_http.js';
import { SecretServiceAuthenticator } from './service_auth.js';
import { registerOpsRoutes } from './ops_http.js';

export interface ComposeOptions {
  /** The Member session boundary (issuance is a separate slice; default: empty). */
  readonly sessions?: SessionStore;
  /** Injected clock (tests); defaults to the real clock. */
  readonly now?: () => Date;
  readonly serviceName?: string;
}

/// Build the fully-wired wallet app from config. Async because seeding the Floor
/// (if configured) publishes the first version.
export async function composeWalletApp(config: WalletConfig, opts: ComposeOptions = {}): Promise<FastifyInstance> {
  const now = opts.now ?? (() => new Date());
  const sessions = opts.sessions ?? new InMemorySessionStore();
  const app = createServer({ serviceName: opts.serviceName ?? 'nia-wallet' });

  // --- Founder-owned seams from config -------------------------------------
  const floorRegistry = new InMemoryFloorRegistry();
  if (config.floorSeed) {
    // The Founder-provided values (from the config file) become Floor version 1.
    await floorRegistry.publish(
      createInitialFloor({ values: config.floorSeed.values, author: config.floorSeed.author, note: config.floorSeed.note, now: now() }),
    );
  }
  const floor = new RegistryFloorSource(floorRegistry);
  const serviceAuth = new SecretServiceAuthenticator(config.serviceTokens);

  // --- Shared stores (durable where an adapter exists) ----------------------
  const remittanceStore = new DurableRemittanceStore(
    new FileDurableStore<Remittance>(join(config.dataDir, 'remittances.json')),
  );
  const operatorEscalations = new InMemoryOperatorEscalations();
  const arrears = new InMemoryArrearsLedger();
  const savingsAccounts = new InMemorySavingsAccountStore();
  const withdrawals = new InMemoryWithdrawalStore();
  const interestPolicy = new NoInterestAccrualPolicy();
  const syncStore = new InMemorySyncStore();
  const reconciliation = new InMemoryReconciliationQueue();
  const grants = new InMemoryGrantStore();
  const rafiqiActions = new InMemoryRafiqiActionStore();

  // Each route group is mounted in its own ENCAPSULATED Fastify scope, so its
  // onSend hook + error handler stay local (no cross-group override) — the routes
  // still resolve at the same `/v1/...` paths (encapsulation scopes hooks, not the
  // URL tree).
  const mount = (register: (scope: FastifyInstance) => void) =>
    app.register(async (scope) => {
      register(scope);
    });

  await Promise.all([
    // Member-facing surfaces.
    mount((s) => registerWalletOverviewRoutes(s, { source: new InMemoryWalletActivitySource({}), sessions })),
    mount((s) => registerFloorRoutes(s, { sessions, registry: floorRegistry, now })),
    mount((s) => registerWageSettlementRoutes(s, { sessions, floor, arrears, recoveryCapBps: config.recoveryCapBps, now })),
    mount((s) => registerSavingsRoutes(s, { sessions, accounts: savingsAccounts, withdrawals, policy: interestPolicy, settleAfterMs: config.savingsSettleMs, now })),
    mount((s) => registerRemittanceRoutes(s, { sessions, store: remittanceStore, now })),
    mount((s) => registerRafiqiRoutes(s, { sessions, grants, actions: rafiqiActions, now })),
    mount((s) => registerSyncRoutes(s, { sessions, store: syncStore, operator: reconciliation, now })),
    // Service-authed surfaces (rail webhooks + ops triggers).
    mount((s) => registerRemittanceRailRoutes(s, { store: remittanceStore, auth: serviceAuth, now })),
    mount((s) =>
      registerOpsRoutes(s, {
        auth: serviceAuth,
        remittance: { store: remittanceStore, operator: operatorEscalations },
        savings: { accounts: savingsAccounts, withdrawals, policy: interestPolicy },
        reconciliation,
        now,
      }),
    ),
  ]);

  await app.ready();
  return app;
}
