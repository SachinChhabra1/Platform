/// Boot entry for the Developer Preview backend.
///
/// One process, one port, BOTH feature surfaces — so `flutter run` against this
/// origin exercises the real Wallet + Membership services through the single base
/// URL the app reads. Defaults to 127.0.0.1:8080; configuration is environment-
/// only. Seeds are demo-only (see server.ts): the Founder Wallet scenario, an
/// active demo Member, and the `sess-ramesh-001` member session.

import { previewLogger, seededPreviewServer, DEMO_SESSION } from './server.js';

const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8080);

const log = previewLogger();
const app = await seededPreviewServer({ logger: log });

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => {
      log.info('preview stopped', { signal });
      process.exit(0);
    });
  });
}

try {
  const address = await app.listen({ host, port });
  log.info('preview started', { listenAddress: address, demoSession: DEMO_SESSION });
} catch (error) {
  log.error('preview failed to start', { error: String(error) });
  process.exit(1);
}
