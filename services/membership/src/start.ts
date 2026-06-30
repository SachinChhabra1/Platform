/// Boot entry for the Membership service HTTP surface (spec 0001 §14).
///
/// Composes `@nia/runtime`'s `createServer` (health + request logging) with the
/// read-only Membership route, over an in-memory repository. The PostgreSQL
/// adapter (ADR-0006) is a later slice; until then this seeds one active Member
/// so the surface is demonstrably runnable. Configuration is environment-only.

import { createLogger } from '@nia/log';
import { createServer, InMemorySessionStore } from '@nia/runtime';
import { registerMembershipRoutes } from './http.js';
import { InMemoryMembershipRepository } from './repository.js';
import { activate, createProspective } from './membership.js';

const serviceName = process.env.SERVICE_NAME ?? 'nia-membership';
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8082);

// Demo seed only (NOT persistence): one active Member. The same opaque demo
// session token the Wallet service seeds binds the client to this Member; real
// tokens are issued after phone verification (Book VIII §1.3) — not built.
const DEMO_MEMBER = 'm-001';
const DEMO_SESSION = 'sess-ramesh-001';
const repository = new InMemoryMembershipRepository();
const log = createLogger({ base: { service: serviceName } });

const app = createServer({ serviceName, logger: log });
registerMembershipRoutes(app, {
  repository,
  sessions: new InMemorySessionStore({
    [DEMO_SESSION]: { membershipId: DEMO_MEMBER, deviceId: 'dev-ramesh-phone' },
  }),
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => {
      log.info('membership stopped', { signal });
      process.exit(0);
    });
  });
}

try {
  await repository.save(
    activate(
      createProspective({ membershipId: DEMO_MEMBER, name: 'Ramesh Kumar' }),
      new Date('2026-01-04T00:00:00.000Z'),
    ),
  );
  const address = await app.listen({ host, port });
  log.info('membership started', { listenAddress: address });
} catch (error) {
  log.error('membership failed to start', { error: String(error) });
  process.exit(1);
}
