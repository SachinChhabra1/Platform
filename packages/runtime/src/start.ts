/// Boot entry for the runtime skeleton.
///
/// Runs a bare instance (health route only) so the skeleton is demonstrably
/// runnable. Real services compose `createServer` with their own routes and
/// provide their own boot entry. Configuration is environment-only — no Member
/// data, no product behaviour.

import { createLogger } from '@nia/log';
import { createServer } from './server.js';

const serviceName = process.env.SERVICE_NAME ?? 'nia-runtime';
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8080);

const log = createLogger({ base: { service: serviceName } });
const app = createServer({ serviceName, logger: log });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => {
      log.info('runtime stopped', { signal });
      process.exit(0);
    });
  });
}

try {
  const address = await app.listen({ host, port });
  // `listenAddress` (not `address`) so @nia/log does not treat the bind
  // host:port as a personal identifier and redact it.
  log.info('runtime started', { listenAddress: address });
} catch (error) {
  log.error('runtime failed to start', { error: String(error) });
  process.exit(1);
}
