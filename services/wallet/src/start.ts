/// Boot entry for the wallet service. Bootstraps the fully-wired HTTP surface
/// (Member routes, rail webhooks, ops triggers, Operator reconciliation) over the
/// durable backing chosen by config — file (offline reference) or Postgres
/// (`bootstrapWalletApp` connects pg and runs the idempotent migration first).
/// Configuration is environment-only; no product value is invented here.
///
/// Note: Member session issuance is a separate slice, so the composed app starts
/// with an EMPTY session store — Member routes default-deny until issuance lands.
/// Set NIA_SERVICE_TOKENS to enable the rail/ops surfaces, and NIA_FLOOR_CONFIG_PATH
/// to seed the authoritative Floor (without it, wage settlement refuses to run).
/// Set NIA_STORE=postgres (+ DATABASE_URL) to run on Postgres instead of files.

import { createLogger } from '@nia/log';
import { bootstrapWalletApp } from './deploy.js';

const serviceName = process.env.SERVICE_NAME ?? 'nia-wallet';
const log = createLogger({ base: { service: serviceName } });

// Env-only config → durable backing (file or Postgres) → fully-wired app.
const { app, config, dispose } = await bootstrapWalletApp(process.env, { serviceName });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app
      .close()
      .then(() => dispose())
      .then(() => {
        log.info('wallet stopped', { signal });
        process.exit(0);
      });
  });
}

try {
  const address = await app.listen({ host: config.host, port: config.port });
  log.info('wallet started', {
    listenAddress: address,
    store: config.store,
    dataDir: config.dataDir,
    recoveryCapBps: config.recoveryCapBps,
    floorConfigured: config.floorSeed !== undefined,
    serviceAuthEnabled: config.serviceTokens.length > 0,
  });
} catch (error) {
  log.error('wallet failed to start', { error: String(error) });
  await dispose();
  process.exit(1);
}
