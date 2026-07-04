/// Boot entry for the wallet service. Loads the Founder/ops-owned configuration
/// from the environment and composes the fully-wired HTTP surface (Member routes,
/// rail webhooks, ops triggers, Operator reconciliation) over durable stores and
/// the config seams (`compose.ts`). Configuration is environment-only; no product
/// value is invented here.
///
/// Note: Member session issuance is a separate slice, so the composed app starts
/// with an EMPTY session store — Member routes default-deny until issuance lands.
/// Set NIA_SERVICE_TOKENS to enable the rail/ops surfaces, and NIA_FLOOR_CONFIG_PATH
/// to seed the authoritative Floor (without it, wage settlement refuses to run).

import { createLogger } from '@nia/log';
import { loadWalletConfig } from './config.js';
import { composeWalletApp } from './compose.js';

const serviceName = process.env.SERVICE_NAME ?? 'nia-wallet';
const log = createLogger({ base: { service: serviceName } });

const config = loadWalletConfig(process.env);
const app = await composeWalletApp(config, { serviceName });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => {
      log.info('wallet stopped', { signal });
      process.exit(0);
    });
  });
}

try {
  const address = await app.listen({ host: config.host, port: config.port });
  log.info('wallet started', {
    listenAddress: address,
    dataDir: config.dataDir,
    recoveryCapBps: config.recoveryCapBps,
    floorConfigured: config.floorSeed !== undefined,
    serviceAuthEnabled: config.serviceTokens.length > 0,
  });
} catch (error) {
  log.error('wallet failed to start', { error: String(error) });
  process.exit(1);
}
