/// Developer Preview backend — the composition that makes "see it" possible.
///
/// The Wallet (`@nia/wallet`) and Membership (`@nia/membership`) services each
/// run as their own process on their own port. The Member app, however, reads a
/// SINGLE base URL (`MemberConfig.apiBaseUrl`) for both. So a real, runnable
/// preview needs one process that serves BOTH feature surfaces under one origin,
/// sharing ONE session store — exactly what this composes.
///
/// This adds NO new domain and NO product behaviour: it wires the existing,
/// already-tested route registrars onto one `@nia/runtime` server. Each feature
/// is registered in its OWN encapsulated Fastify scope (`app.register`) so the
/// per-surface concerns each registrar installs — the server-time `onSend` hook
/// and the error handler — stay isolated and don't clobber one another. Seeds
/// are in-memory and demo-only — the real ledger, persistence, and phone-first
/// session issuance are separate, spec-driven slices.

import type { FastifyInstance } from 'fastify';
import { createLogger, type Logger } from '@nia/log';
import { createServer, InMemorySessionStore, type SessionStore } from '@nia/runtime';
import {
  InMemoryWalletActivitySource,
  registerWalletOverviewRoutes,
  rupees,
  type WalletActivity,
  type WalletActivitySource,
} from '@nia/wallet';
import {
  activate,
  createProspective,
  InMemoryMembershipRepository,
  registerMembershipRoutes,
  type MembershipRepository,
} from '@nia/membership';

/** The one Member the preview is seeded for, and his opaque session token. The
 *  token is NOT the membership id (that was the retired stub); it is resolved
 *  server-side to the bound Member (the auth boundary). */
export const DEMO_MEMBER = 'm-001';
export const DEMO_SESSION = 'sess-ramesh-001';
export const DEMO_DEVICE = 'dev-ramesh-phone';

/** The Founder-accepted Wallet scenario (the same figures the sample app shows):
 *  May carried ₹680 forward; June is the wage month. The two §3 figures are
 *  distinct by construction — stayed ≠ available. */
const seed = (
  partial: Omit<WalletActivity, 'affectsAvailable' | 'changesHoldings'> &
    Partial<Pick<WalletActivity, 'affectsAvailable' | 'changesHoldings'>>,
): WalletActivity => ({ affectsAvailable: true, changesHoldings: true, ...partial });

const DEMO_WALLET_LOG: readonly WalletActivity[] = [
  seed({ id: 'a0', occurredOn: '2026-05-31', category: 'wage', direction: 'in', amount: rupees(680) }),
  seed({ id: 'a1', occurredOn: '2026-06-01', category: 'wage', direction: 'in', amount: rupees(14000) }),
  seed({ id: 'a2', occurredOn: '2026-06-03', category: 'rent', direction: 'out', amount: rupees(2400) }),
  seed({ id: 'a3', occurredOn: '2026-06-05', category: 'curry', direction: 'out', amount: rupees(1800) }),
  seed({ id: 'a4', occurredOn: '2026-06-10', category: 'savings', direction: 'out', amount: rupees(2000), changesHoldings: false }),
  seed({ id: 'a5', occurredOn: '2026-06-15', category: 'remittance', direction: 'out', amount: rupees(5000) }),
];

export interface PreviewDeps {
  readonly source: WalletActivitySource;
  readonly repository: MembershipRepository;
  readonly sessions: SessionStore;
  readonly logger?: Logger;
  /** Clock for "current month" + the server-time header. Injectable for tests. */
  readonly now?: () => Date;
}

/** Compose the Wallet + Membership surfaces onto one `@nia/runtime` server,
 *  sharing the given session store. The caller owns `listen`/`close`. */
export function createPreviewServer(deps: PreviewDeps): FastifyInstance {
  const loggerOpt = deps.logger ? { logger: deps.logger } : {};
  const app = createServer({ serviceName: 'nia-preview', ...loggerOpt });
  const routeDeps = deps.now
    ? { sessions: deps.sessions, now: deps.now }
    : { sessions: deps.sessions };
  // Each surface in its own encapsulated scope: routes mount at their absolute
  // `/v1/...` paths regardless, but the hook + error handler each registrar
  // installs stay isolated to that scope.
  void app.register(async (wallet) => {
    registerWalletOverviewRoutes(wallet, { source: deps.source, ...routeDeps });
  });
  void app.register(async (membership) => {
    registerMembershipRoutes(membership, { repository: deps.repository, ...routeDeps });
  });
  return app;
}

/** Build a fully-seeded preview backend: the Founder Wallet scenario, an active
 *  demo Member, and one `member`-scope session (`sess-ramesh-001`). One source of
 *  truth for both `start.ts` and the tests. Returns the app plus the seeded deps
 *  (the repository needs an async `save`, done here). */
export async function seededPreviewServer(
  options: { logger?: Logger; now?: () => Date } = {},
): Promise<FastifyInstance> {
  const repository = new InMemoryMembershipRepository();
  // Activated on the demo birthday so the lifecycle state reads `member`.
  await repository.save(
    activate(
      createProspective({ membershipId: DEMO_MEMBER, name: 'Ramesh Kumar' }),
      new Date('2026-01-04T00:00:00.000Z'),
    ),
  );
  const deps: PreviewDeps = {
    source: new InMemoryWalletActivitySource({ [DEMO_MEMBER]: DEMO_WALLET_LOG }),
    repository,
    sessions: new InMemorySessionStore({
      [DEMO_SESSION]: { membershipId: DEMO_MEMBER, deviceId: DEMO_DEVICE, scope: 'member' },
    }),
    ...(options.logger ? { logger: options.logger } : {}),
    ...(options.now ? { now: options.now } : {}),
  };
  return createPreviewServer(deps);
}

/** A default logger tagged for the preview process. */
export function previewLogger(): Logger {
  return createLogger({ base: { service: 'nia-preview' } });
}
