/// Boot entry for the Wallet service HTTP surface (spec 0001 §14 step 4 slice 2).
///
/// Composes `@nia/runtime`'s `createServer` (health + request logging) with the
/// read-only Wallet Overview routes, over an in-memory activity source. The
/// ledger-backed adapter is a later, senior-reviewed slice (ADR-0008); until
/// then this seeds the Founder-accepted prototype scenario so the surface is
/// demonstrably runnable end to end. Configuration is environment-only.

import { createLogger } from '@nia/log';
import { createServer } from '@nia/runtime';
import { registerWalletOverviewRoutes } from './http.js';
import { InMemoryWalletActivitySource } from './source.js';
import { rupees } from './money.js';
import type { WalletActivity } from './activity.js';

const serviceName = process.env.SERVICE_NAME ?? 'nia-wallet';
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 8081);

// Demo seed only (NOT a ledger): the prototype Wallet scenario, keyed by the
// membership id a client presents as its bearer token. May carried ₹680 forward;
// June is the wage month. The two figures are distinct by construction (§3).
const seed = (
  partial: Omit<WalletActivity, 'affectsAvailable' | 'changesHoldings'> &
    Partial<Pick<WalletActivity, 'affectsAvailable' | 'changesHoldings'>>,
): WalletActivity => ({ affectsAvailable: true, changesHoldings: true, ...partial });

const DEMO_MEMBER = 'm-001';
const DEMO_LOG: readonly WalletActivity[] = [
  seed({ id: 'a0', occurredOn: '2026-05-31', category: 'wage', direction: 'in', amount: rupees(680) }),
  seed({ id: 'a1', occurredOn: '2026-06-01', category: 'wage', direction: 'in', amount: rupees(14000) }),
  seed({ id: 'a2', occurredOn: '2026-06-03', category: 'rent', direction: 'out', amount: rupees(2400) }),
  seed({ id: 'a3', occurredOn: '2026-06-05', category: 'curry', direction: 'out', amount: rupees(1800) }),
  seed({ id: 'a4', occurredOn: '2026-06-10', category: 'savings', direction: 'out', amount: rupees(2000), changesHoldings: false }),
  seed({ id: 'a5', occurredOn: '2026-06-15', category: 'remittance', direction: 'out', amount: rupees(5000) }),
];

const log = createLogger({ base: { service: serviceName } });
const app = createServer({ serviceName, logger: log });
registerWalletOverviewRoutes(app, {
  source: new InMemoryWalletActivitySource({ [DEMO_MEMBER]: DEMO_LOG }),
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().then(() => {
      log.info('wallet stopped', { signal });
      process.exit(0);
    });
  });
}

try {
  const address = await app.listen({ host, port });
  log.info('wallet started', { listenAddress: address });
} catch (error) {
  log.error('wallet failed to start', { error: String(error) });
  process.exit(1);
}
