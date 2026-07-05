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

import type { FastifyInstance } from 'fastify';
import { createServer, type SessionStore } from '@nia/runtime';
import type { WalletConfig } from './config.js';
import { FileDurableStoreFactory, type DurableStoreFactory } from './durable_factory.js';
import { DurableSessionStore, type StoredSession } from './session_store.js';
import { InMemoryMemberDirectory } from './member_directory.js';
import { registerSessionRoutes } from './session_http.js';
import { InMemoryWalletActivitySource } from './source.js';
import { registerWalletOverviewRoutes } from './http.js';
import { DurableFloorRegistry, RegistryFloorSource } from './the_floor_registry.js';
import { createInitialFloor, type FloorVersion } from './the_floor.js';
import { registerFloorRoutes } from './floor_http.js';
import { DurableArrearsLedger, type ArrearsRecord, type WaiverRecord } from './arrears.js';
import { registerWageSettlementRoutes } from './wage_http.js';
import { NoInterestAccrualPolicy, type SavingsAccount, type Withdrawal } from './savings.js';
import { DurableSavingsAccountStore, DurableWithdrawalStore } from './savings_ledger.js';
import { registerSavingsRoutes } from './savings_http.js';
import { DurableRemittanceStore, DurableOperatorEscalations, type OperatorEscalation } from './remittance_ledger.js';
import type { Remittance } from './remittance.js';
import { registerRemittanceRoutes } from './remittance_http.js';
import { registerRemittanceRailRoutes } from './rail_http.js';
import { DurableGrantStore, DurableRafiqiActionStore } from './rafiqi_ledger.js';
import type { AuthorizationGrant, RafiqiAction } from './rafiqi.js';
import { registerRafiqiRoutes } from './rafiqi_http.js';
import { NoMoneyEffect } from './rafiqi_orchestrator.js';
import { DurableSyncStore, DurableReconciliationQueue, type SyncRecord, type ReconciliationItem } from './offline_sync.js';
import { registerSyncRoutes } from './sync_http.js';
import { SecretServiceAuthenticator } from './service_auth.js';
import { InMemoryOperatorDirectory } from './operator_auth.js';
import { registerOpsRoutes } from './ops_http.js';

export interface ComposeOptions {
  /** The Member session boundary (issuance is a separate slice; default: empty). */
  readonly sessions?: SessionStore;
  /** Injected clock (tests); defaults to the real clock. */
  readonly now?: () => Date;
  readonly serviceName?: string;
  /** The durable-store backing. If omitted, it is chosen from `config.store`:
   *  'file' ⇒ FileDurableStoreFactory; 'postgres' ⇒ throws (a live SqlExecutor
   *  must be connected first — use `bootstrapWalletApp`, which injects it). */
  readonly stores?: DurableStoreFactory;
}

/// Build the fully-wired wallet app from config. Async because seeding the Floor
/// (if configured) publishes the first version. The durable backing is chosen once
/// here (file or an injected factory) and every store opens by logical name — the
/// domain is identical across backings.
export async function composeWalletApp(config: WalletConfig, opts: ComposeOptions = {}): Promise<FastifyInstance> {
  const now = opts.now ?? (() => new Date());
  const app = createServer({ serviceName: opts.serviceName ?? 'nia-wallet' });

  // --- Shared stores — all durable, opened by logical name via the factory ----
  // 'file' is the offline reference; 'postgres' is injected by bootstrapWalletApp
  // (which connects the live SqlExecutor). Swapping the backing changes nothing
  // below — the stores compose over the DurableStore interface, not a concrete impl.
  const stores = opts.stores ?? defaultStoreFactory(config);
  const fds = stores.open.bind(stores);

  // The session boundary: durable + shared across the authed surfaces, hydrated
  // from the backing at boot (issued sessions survive a restart). Tests inject
  // their own store via opts.sessions. Issuance (login) is registered below.
  const sessions = opts.sessions ?? (await DurableSessionStore.load(fds<StoredSession>('sessions')));

  const floorRegistry = new DurableFloorRegistry(fds<FloorVersion>('floor'));
  if (config.floorSeed && (await floorRegistry.current()) === undefined) {
    // The Founder-provided values (from the config file) become Floor version 1
    // (idempotent across restart — only seeded if no version exists yet).
    await floorRegistry.publish(
      createInitialFloor({ values: config.floorSeed.values, author: config.floorSeed.author, note: config.floorSeed.note, now: now() }),
    );
  }
  const floor = new RegistryFloorSource(floorRegistry);
  const serviceAuth = new SecretServiceAuthenticator(config.serviceTokens);

  const remittanceStore = new DurableRemittanceStore(fds<Remittance>('remittances'));
  const operatorEscalations = new DurableOperatorEscalations(fds<OperatorEscalation>('escalations'));
  const arrears = new DurableArrearsLedger(fds<ArrearsRecord>('arrears'), fds<WaiverRecord>('waivers'));
  const savingsAccounts = new DurableSavingsAccountStore(fds<SavingsAccount>('savings-accounts'));
  const withdrawals = new DurableWithdrawalStore(fds<Withdrawal>('withdrawals'));
  const interestPolicy = new NoInterestAccrualPolicy();
  const syncStore = new DurableSyncStore(fds<SyncRecord>('sync'));
  const reconciliation = new DurableReconciliationQueue(fds<ReconciliationItem>('reconciliation'));
  const grants = new DurableGrantStore(fds<AuthorizationGrant>('grants'));
  const rafiqiActions = new DurableRafiqiActionStore(fds<RafiqiAction>('rafiqi-actions'));

  // Each route group is mounted in its own ENCAPSULATED Fastify scope, so its
  // onSend hook + error handler stay local (no cross-group override) — the routes
  // still resolve at the same `/v1/...` paths (encapsulation scopes hooks, not the
  // URL tree).
  const mount = (register: (scope: FastifyInstance) => void) =>
    app.register(async (scope) => {
      register(scope);
    });

  await Promise.all([
    // Login — session issuance (phone-first, provisioned directory). NOT
    // session-gated: it is the front of the chain every other surface validates.
    mount((s) => registerSessionRoutes(s, { sessions, directory: new InMemoryMemberDirectory(config.memberDirectory), now })),
    // Member-facing surfaces.
    mount((s) => registerWalletOverviewRoutes(s, { source: new InMemoryWalletActivitySource({}), sessions })),
    mount((s) => registerFloorRoutes(s, { sessions, registry: floorRegistry, now })),
    mount((s) => registerWageSettlementRoutes(s, { sessions, floor, arrears, recoveryCapBps: config.recoveryCapBps, now })),
    mount((s) => registerSavingsRoutes(s, { sessions, accounts: savingsAccounts, withdrawals, policy: interestPolicy, settleAfterMs: config.savingsSettleMs, now })),
    mount((s) => registerRemittanceRoutes(s, { sessions, store: remittanceStore, now })),
    mount((s) => registerRafiqiRoutes(s, { sessions, grants, actions: rafiqiActions, effect: new NoMoneyEffect(), now })),
    mount((s) => registerSyncRoutes(s, { sessions, store: syncStore, operator: reconciliation, now })),
    // Service-authed surfaces (rail webhooks + ops triggers).
    mount((s) => registerRemittanceRailRoutes(s, { store: remittanceStore, auth: serviceAuth, now })),
    mount((s) =>
      registerOpsRoutes(s, {
        auth: serviceAuth,
        remittance: { store: remittanceStore, operator: operatorEscalations },
        savings: { accounts: savingsAccounts, withdrawals, policy: interestPolicy },
        reconciliation: { queue: reconciliation, store: syncStore, operators: new InMemoryOperatorDirectory(config.operatorCredentials) },
        now,
      }),
    ),
  ]);

  await app.ready();
  return app;
}

/// The default durable backing when none is injected. 'file' composes the offline
/// reference persistence directly; 'postgres' cannot be built here because it needs
/// a live SqlExecutor (an async connect + migration) — the caller must connect one
/// and inject a PostgresDurableStoreFactory via `opts.stores`. `bootstrapWalletApp`
/// (deploy.ts) does exactly that, so production never hits this throw.
function defaultStoreFactory(config: WalletConfig): DurableStoreFactory {
  if (config.store === 'postgres') {
    throw new Error(
      "NIA_STORE=postgres requires a live SqlExecutor — use bootstrapWalletApp(env) (deploy.ts), which connects pg and injects the Postgres store factory, instead of composeWalletApp() directly",
    );
  }
  return new FileDurableStoreFactory(config.dataDir);
}
