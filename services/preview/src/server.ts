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
  close,
  createProspective,
  InMemoryMembershipRepository,
  pause,
  registerMembershipRoutes,
  type MembershipRepository,
} from '@nia/membership';
import {
  InMemoryMemberDirectory,
  registerSessionRoutes,
  type MemberDirectory,
} from '@nia/sessions';

/** The primary Member the preview is seeded for, and his opaque session token.
 *  The token is NOT the membership id (that was the retired stub); it is resolved
 *  server-side to the bound Member (the auth boundary). */
export const DEMO_MEMBER = 'm-001';
export const DEMO_SESSION = 'sess-ramesh-001';
export const DEMO_DEVICE = 'dev-ramesh-phone';

/** Demo phones for `POST /v1/sessions` (phone-first re-proof). The app prefills
 *  the primary one so the "Phone → Session" journey runs out of the box. */
export const DEMO_PHONE = '+919800000001';
export const DEMO_PAUSED_PHONE = '+919800000002';
export const DEMO_CLOSED_PHONE = '+919800000003';

/** Extra demo Members so the Preview can show every standing (Q2): a paused and
 *  a closed Member, each behind their own session token. Switch `nia preview`'s
 *  NIA_MEMBER_TOKEN to one of these to walk that state. (A closed Member keeping
 *  a valid session is a Preview convenience — the force-end on Closed is a later
 *  backend slice, spec 0002 ERR-7.) */
export const DEMO_PAUSED_MEMBER = 'm-002';
export const DEMO_PAUSED_SESSION = 'sess-paused';
export const DEMO_CLOSED_MEMBER = 'm-003';
export const DEMO_CLOSED_SESSION = 'sess-closed';

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
  /** Phone → Member, for the issuance surface (`POST /v1/sessions`). */
  readonly directory: MemberDirectory;
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
  void app.register(async (sessions) => {
    const nowOpt = deps.now ? { now: deps.now } : {};
    registerSessionRoutes(sessions, {
      directory: deps.directory,
      sessions: deps.sessions,
      ...nowOpt,
    });
  });
  return app;
}

/** Build a fully-seeded preview backend: the Founder Wallet scenario, an active
 *  demo Member, and one `member`-scope session (`sess-ramesh-001`). One source of
 *  truth for both `start.ts` and the tests. Returns the app plus the seeded deps
 *  (the repository needs an async `save`, done here). */
/** The Founder Wallet scenario is June data. The preview is a fixed demo, not a
 *  live ledger, so its "current month" is pinned to the scenario month — else the
 *  story is invisible outside June (e.g. it reads as zeros in July). */
const PREVIEW_ASOF = '2026-06-20T00:00:00.000Z';

export async function seededPreviewServer(
  options: { logger?: Logger; now?: () => Date } = {},
): Promise<FastifyInstance> {
  const now = options.now ?? (() => new Date(PREVIEW_ASOF));
  const born = new Date('2026-01-04T00:00:00.000Z');
  const repository = new InMemoryMembershipRepository();
  // Activated on the demo birthday so the lifecycle state reads `member`.
  await repository.save(
    activate(createProspective({ membershipId: DEMO_MEMBER, name: 'Ramesh Kumar' }), born),
  );
  // A paused Member (continuity preserved, FD-4) and a closed Member, so every
  // standing is walkable in the Preview.
  await repository.save(
    pause(
      activate(createProspective({ membershipId: DEMO_PAUSED_MEMBER, name: 'Sunita Devi' }), born),
      { code: 'travel', recordedBy: { kind: 'operator', operatorId: 'op-1' } },
    ),
  );
  await repository.save(
    close(
      activate(createProspective({ membershipId: DEMO_CLOSED_MEMBER, name: 'Imran Shaikh' }), born),
      { code: 'moved_on' },
    ),
  );
  const deps: PreviewDeps = {
    source: new InMemoryWalletActivitySource({
      [DEMO_MEMBER]: DEMO_WALLET_LOG,
      [DEMO_PAUSED_MEMBER]: DEMO_WALLET_LOG,
      [DEMO_CLOSED_MEMBER]: DEMO_WALLET_LOG,
    }),
    repository,
    sessions: new InMemorySessionStore({
      [DEMO_SESSION]: { membershipId: DEMO_MEMBER, deviceId: DEMO_DEVICE, scope: 'member' },
      [DEMO_PAUSED_SESSION]: { membershipId: DEMO_PAUSED_MEMBER, deviceId: 'dev-sunita', scope: 'member' },
      [DEMO_CLOSED_SESSION]: { membershipId: DEMO_CLOSED_MEMBER, deviceId: 'dev-imran', scope: 'member' },
    }),
    // Phone-first re-proof directory: the three demo Members' phones.
    directory: new InMemoryMemberDirectory({
      [DEMO_PHONE]: DEMO_MEMBER,
      [DEMO_PAUSED_PHONE]: DEMO_PAUSED_MEMBER,
      [DEMO_CLOSED_PHONE]: DEMO_CLOSED_MEMBER,
    }),
    now,
    ...(options.logger ? { logger: options.logger } : {}),
  };
  return createPreviewServer(deps);
}

/** A default logger tagged for the preview process. */
export function previewLogger(): Logger {
  return createLogger({ base: { service: 'nia-preview' } });
}
