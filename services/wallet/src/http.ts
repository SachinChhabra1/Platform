/// HTTP adapter for the Wallet Overview read model (spec 0001 §14 step 4 slice 2;
/// contract: packages/types/openapi/openapi.wallet.yaml).
///
/// A driving adapter over the pure read model and the `WalletActivitySource`
/// port (ports & adapters, ADR-0008): it adds NO policy and moves NO money. It
/// resolves the Member, projects the Overview, and maps the domain
/// `MonthlyOverview` (camelCase) into the snake_case wire shape the contract
/// defines — in integer paise, because formatting (₹, the Member's script) is
/// the client's job (Book III §6.4). Request logging and the lifecycle belong to
/// `@nia/runtime`'s `createServer`; this only registers routes.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import type { Money } from './money.js';
import type { MoneyStoryLine, MonthlyOverview } from './overview.js';
import {
  availableMonths,
  currentMonthOverview,
  overviewForMonth,
} from './overview.js';
import type { WalletActivitySource } from './source.js';

const MONTH = /^\d{4}-\d{2}$/;

export interface WalletRouteDeps {
  /** Read-only source of each Member's assembled activity (the port). */
  readonly source: WalletActivitySource;
  /**
   * Resolves the bearer session token to the signed-in Member (the auth
   * boundary, `@nia/runtime`). Default-deny: an unknown token is no session.
   */
  readonly sessions: SessionStore;
  /**
   * Clock for "the current month" and the server-time header. Injectable for
   * tests; defaults to the system clock. Server time is the only time the
   * backend trusts (Book VIII §1.5).
   */
  readonly now?: () => Date;
}

// --- Wire shapes (the snake_case contract). Kept beside the mapping so this
// adapter owns the domain→wire translation and nothing else has to know it. ---
interface MoneyDto {
  readonly minor: number;
  readonly currency: 'INR';
}
interface MoneyStoryLineDto {
  readonly activity_id: string;
  readonly category: string;
  readonly direction: 'in' | 'out';
  readonly amount: MoneyDto;
}
interface MonthlyOverviewDto {
  readonly month: string;
  readonly received: MoneyDto;
  readonly stayed_this_month: MoneyDto;
  readonly available_balance: MoneyDto;
  readonly story: readonly MoneyStoryLineDto[];
}

function moneyDto(money: Money): MoneyDto {
  return { minor: money.minor, currency: money.currency };
}

function storyLineDto(line: MoneyStoryLine): MoneyStoryLineDto {
  return {
    activity_id: line.activityId,
    category: line.category,
    direction: line.direction,
    amount: moneyDto(line.amount),
  };
}

function overviewDto(overview: MonthlyOverview): MonthlyOverviewDto {
  return {
    month: overview.month,
    received: moneyDto(overview.received),
    stayed_this_month: moneyDto(overview.stayedThisMonth),
    available_balance: moneyDto(overview.availableBalance),
    story: overview.story.map(storyLineDto),
  };
}

/** The Nia error envelope (base contract `#/components/schemas/Error`). */
function errorEnvelope(code: string, message: string) {
  return { code, message, correlation_id: randomUUID() };
}

/**
 * Registers the read-only Wallet Overview routes on an existing app (built by
 * `@nia/runtime`'s `createServer`):
 *   • GET /v1/wallet/overview?month=  → MonthlyOverview (current month if omitted)
 *   • GET /v1/wallet/overview/months  → the reachable history, most recent first
 * Every response carries `X-Nia-Server-Time`; every error carries the envelope.
 */
export function registerWalletOverviewRoutes(
  app: FastifyInstance,
  deps: WalletRouteDeps,
): void {
  const now = deps.now ?? (() => new Date());

  // Server time on every response (base contract: Book VIII §1.5, §4.1).
  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.hasHeader('X-Nia-Server-Time')) {
      reply.header('X-Nia-Server-Time', now().toISOString());
    }
    return payload;
  });

  // Unexpected failures still carry the full error envelope (Book VIII §4.7).
  app.setErrorHandler(async (_error, _request, reply: FastifyReply) => {
    return reply
      .code(500)
      .send(errorEnvelope('internal_error', 'An unexpected error occurred.'));
  });

  // Resolve the signed-in Member, enforcing the session boundary AND its scope:
  //   • no/invalid session → 401 default-deny (Book VIII §1.4);
  //   • a `pre_membership` session → 403 — Wallet is never reachable by a
  //     Prospective's limited onboarding-status session (spec 0002 FD-S8 / ERR-1).
  // Sends the error and returns `undefined` on denial; the caller then returns.
  function memberOrDeny(
    request: FastifyRequest,
    reply: FastifyReply,
  ): string | undefined {
    const session = sessionFromRequest(request, deps.sessions);
    if (!session) {
      void reply
        .code(401)
        .send(errorEnvelope('unauthorized', 'Missing or invalid session.'));
      return undefined;
    }
    if (session.scope !== 'member') {
      void reply
        .code(403)
        .send(errorEnvelope('forbidden', 'This needs a full Member session.'));
      return undefined;
    }
    return session.membershipId;
  }

  app.get(`${API_PREFIX}/wallet/overview`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const month = (request.query as { month?: string }).month;
    if (month !== undefined && !MONTH.test(month)) {
      return reply
        .code(400)
        .send(
          errorEnvelope('invalid_month', "Query 'month' must be 'YYYY-MM'."),
        );
    }
    const activities = await deps.source.listForMember(member);
    const overview =
      month === undefined
        ? currentMonthOverview(activities, now())
        : overviewForMonth(activities, month);
    return reply.code(200).send(overviewDto(overview));
  });

  app.get(`${API_PREFIX}/wallet/overview/months`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;
    const activities = await deps.source.listForMember(member);
    return reply.code(200).send({ months: availableMonths(activities) });
  });
}
