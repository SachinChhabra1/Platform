/// Deploy bootstrap (infra) — the one place that turns Founder/ops config into a
/// running, correctly-backed wallet app. It bridges the async gap `composeWalletApp`
/// deliberately does not cross: connecting the live Postgres pool and running the
/// migration BEFORE composition.
///
///   NIA_STORE=file      → compose over the file-backed factory (offline reference).
///   NIA_STORE=postgres  → connect pg (DATABASE_URL / PG*), run the idempotent
///                         migration, then compose over the Postgres factory.
///
/// It invents no product value — every value still comes from `loadWalletConfig`
/// (env/files only). Returns a `dispose()` so the caller can close the pool on
/// shutdown. The Postgres path needs the `pg` driver installed in the runtime;
/// `connectPgSqlExecutor` throws an actionable error if it is absent.

import type { FastifyInstance } from 'fastify';
import { loadWalletConfig, type WalletConfig } from './config.js';
import { composeWalletApp, type ComposeOptions } from './compose.js';
import { connectPgSqlExecutor } from './pg_executor.js';
import { PostgresDurableStoreFactory, runWalletMigrations } from './durable_factory.js';

export interface BootstrappedWalletApp {
  readonly app: FastifyInstance;
  readonly config: WalletConfig;
  /** Release backing resources (closes the pg pool when store=postgres). */
  dispose(): Promise<void>;
}

/// Load config from the environment and compose the fully-wired, correctly-backed
/// app. For Postgres it connects the pool and runs migrations first; for file it
/// composes directly. `opts.stores` still wins if a caller injects a backing
/// (tests). Async because both connecting pg and seeding the Floor are async.
export async function bootstrapWalletApp(
  env: Readonly<Record<string, string | undefined>>,
  opts: ComposeOptions = {},
): Promise<BootstrappedWalletApp> {
  const config = loadWalletConfig(env);

  // A caller-injected backing (tests) short-circuits the config-driven choice.
  if (opts.stores !== undefined || config.store === 'file') {
    const app = await composeWalletApp(config, opts);
    return { app, config, dispose: async () => {} };
  }

  // config.store === 'postgres': connect the live pool, migrate, then compose.
  const sql = await connectPgSqlExecutor({ connectionString: config.databaseUrl });
  await runWalletMigrations(sql);
  const app = await composeWalletApp(config, { ...opts, stores: new PostgresDurableStoreFactory(sql) });
  return { app, config, dispose: () => sql.end() };
}
