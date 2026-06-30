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
 * Resolve the Member from the session. PRE-AUTH STUB: real sessions are
 * phone-first, device-bound, opaque bearer tokens (Book VIII §1.3); until that
 * slice lands, the bearer token IS the membership id. Default-deny: no token,
 * no Wallet (Book VIII §1.4).
 */
function memberFrom(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : undefined;
}

/**
 * Registers the read-only Wallet Overview routes on an existing app (built by
 * `@nia/runtime`'s `createServer`):
 *   • GET /wallet/overview?month=  → MonthlyOverview (current month if omitted)
 *   • GET /wallet/overview/months  → the reachable history, most recent first
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

  app.get('/wallet/overview', async (request, reply) => {
    const member = memberFrom(request);
    if (!member) {
      return reply
        .code(401)
        .send(errorEnvelope('unauthorized', 'Missing or invalid session.'));
    }
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

  app.get('/wallet/overview/months', async (request, reply) => {
    const member = memberFrom(request);
    if (!member) {
      return reply
        .code(401)
        .send(errorEnvelope('unauthorized', 'Missing or invalid session.'));
    }
    const activities = await deps.source.listForMember(member);
    return reply.code(200).send({ months: availableMonths(activities) });
  });
}
