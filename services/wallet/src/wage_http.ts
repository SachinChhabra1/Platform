/// HTTP adapter for the Wage Flow settlement (R3; contract:
/// packages/types/openapi/openapi.wage.yaml; ruling: ADR-0012 / OD-1, locked in
/// /ENGINEERING_LOCK.md).
///
/// A driving adapter over the pure `allocateWage` allocator. It adds NO policy of
/// its own: it resolves the Member (default-deny), reads the dignity floor
/// SERVER-SIDE through the injected `FloorSource` (never from the request body —
/// OD-6), runs the locked waterfall, and maps the domain result into the
/// snake_case wire shape. The deduction order, arrears carry-forward, and the
/// employer-shortfall fee waiver all live in `allocateWage` (ADR-0012); this
/// adapter must not reinterpret them.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, sessionFromRequest, type SessionStore } from '@nia/runtime';
import type { FloorSource } from './floor.js';
import { arrearsFrom, type ArrearsLedger } from './arrears.js';
import {
  allocateWage,
  type ShortfallCause,
  type WageAllocation,
  type WageClaims,
} from './wage.js';

export interface WageRouteDeps {
  /** The auth boundary (`@nia/runtime`). Default-deny: an unknown token is no session. */
  readonly sessions: SessionStore;
  /**
   * The dignity-floor seam. The floor is resolved server-side per Member and is
   * NEVER accepted from the client (OD-6). The concrete `the_floor` config
   * (ADR-0017) plugs in here later.
   */
  readonly floor: FloorSource;
  /**
   * The arrears seam. Deferred claims carry forward (ADR-0012) — the settlement
   * records them here. Recording only; RECOVERY of arrears from a future wage is
   * an uncovered decision (OD-7) and is deliberately not done.
   */
  readonly arrears: ArrearsLedger;
  /** Clock for the server-time header and the arrears `arisenOn` date. Injectable for tests. */
  readonly now?: () => Date;
}

const CAUSES: ReadonlySet<ShortfallCause> = new Set<ShortfallCause>([
  'employer_caused',
  'member_caused',
  'none',
]);

// Wire (snake_case, per the contract) → domain (camelCase) claim keys.
const CLAIM_WIRE_TO_DOMAIN: Readonly<Record<string, keyof WageClaims>> = {
  rent: 'rent',
  curry: 'curry',
  remittance: 'remittance',
  savings: 'savings',
  membership_fee: 'membershipFee',
  advance_repayment: 'advanceRepayment',
};
const CLAIM_DOMAIN_TO_WIRE: Readonly<Record<keyof WageClaims, string>> = {
  rent: 'rent',
  curry: 'curry',
  remittance: 'remittance',
  savings: 'savings',
  membershipFee: 'membership_fee',
  advanceRepayment: 'advance_repayment',
};

interface MoneyDto {
  readonly minor: number;
  readonly currency: 'INR';
}

function money(paise: number): MoneyDto {
  return { minor: paise, currency: 'INR' };
}

function claimsDto(claims: WageClaims): Record<string, MoneyDto> {
  const out: Record<string, MoneyDto> = {};
  for (const domainKey of Object.keys(CLAIM_DOMAIN_TO_WIRE) as (keyof WageClaims)[]) {
    out[CLAIM_DOMAIN_TO_WIRE[domainKey]] = money(claims[domainKey]);
  }
  return out;
}

function allocationDto(a: WageAllocation) {
  return {
    take_home: money(a.takeHomePaise),
    paid: claimsDto(a.paid),
    arrears: claimsDto(a.arrears),
    waived_membership_fee: money(a.waivedMembershipFeePaise),
    floor_breached: a.floorBreached,
    shortfall: a.shortfall,
  };
}

function errorEnvelope(code: string, message: string) {
  return { code, message, correlation_id: randomUUID() };
}

/** Validates a wire Money and returns its paise, or null if malformed. */
function readPaise(value: unknown): number | null {
  if (typeof value !== 'object' || value === null) return null;
  const m = value as { minor?: unknown; currency?: unknown };
  if (m.currency !== 'INR') return null;
  if (typeof m.minor !== 'number' || !Number.isInteger(m.minor) || m.minor < 0) return null;
  return m.minor;
}

type ParsedBody =
  | { readonly ok: true; readonly wagePaise: number; readonly claims: WageClaims; readonly cause: ShortfallCause }
  | { readonly ok: false; readonly code: string; readonly detail: string };

/**
 * Parses and validates a settlement request. Note what it deliberately does NOT
 * read: any `dignity_floor`/`floor` field. The floor is server-side (OD-6), so
 * unknown fields are simply ignored — a client cannot smuggle a floor in.
 */
function parseSettlementBody(body: unknown): ParsedBody {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, code: 'invalid_request', detail: 'Body must be a JSON object.' };
  }
  const b = body as { wage?: unknown; claims?: unknown; cause?: unknown };

  const wagePaise = readPaise(b.wage);
  if (wagePaise === null) {
    return { ok: false, code: 'invalid_wage', detail: "Field 'wage' must be Money in non-negative integer paise." };
  }

  if (typeof b.claims !== 'object' || b.claims === null) {
    return { ok: false, code: 'invalid_claims', detail: "Field 'claims' is required." };
  }
  const claimsWire = b.claims as Record<string, unknown>;
  const claims: Record<keyof WageClaims, number> = {
    rent: 0,
    curry: 0,
    remittance: 0,
    savings: 0,
    membershipFee: 0,
    advanceRepayment: 0,
  };
  for (const [wireKey, domainKey] of Object.entries(CLAIM_WIRE_TO_DOMAIN) as [
    string,
    keyof WageClaims,
  ][]) {
    const paise = readPaise(claimsWire[wireKey]);
    if (paise === null) {
      return { ok: false, code: 'invalid_claims', detail: `Claim '${wireKey}' must be Money in non-negative integer paise.` };
    }
    claims[domainKey] = paise;
  }

  if (typeof b.cause !== 'string' || !CAUSES.has(b.cause as ShortfallCause)) {
    return { ok: false, code: 'invalid_cause', detail: "Field 'cause' must be one of employer_caused, member_caused, none." };
  }

  return { ok: true, wagePaise, claims, cause: b.cause as ShortfallCause };
}

/**
 * Registers the wage-settlement route on an app built by `@nia/runtime`'s
 * `createServer`:
 *   • POST /v1/wage/settlements → WageAllocation (per ADR-0012)
 * Every response carries `X-Nia-Server-Time`; every error carries the envelope.
 */
export function registerWageSettlementRoutes(app: FastifyInstance, deps: WageRouteDeps): void {
  const now = deps.now ?? (() => new Date());

  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.hasHeader('X-Nia-Server-Time')) {
      reply.header('X-Nia-Server-Time', now().toISOString());
    }
    return payload;
  });

  app.setErrorHandler(async (_error, _request, reply: FastifyReply) => {
    return reply.code(500).send(errorEnvelope('internal_error', 'An unexpected error occurred.'));
  });

  function memberOrDeny(request: FastifyRequest, reply: FastifyReply): string | undefined {
    const session = sessionFromRequest(request, deps.sessions);
    if (!session) {
      void reply.code(401).send(errorEnvelope('unauthorized', 'Missing or invalid session.'));
      return undefined;
    }
    if (session.scope !== 'member') {
      void reply.code(403).send(errorEnvelope('forbidden', 'This needs a full Member session.'));
      return undefined;
    }
    return session.membershipId;
  }

  app.post(`${API_PREFIX}/wage/settlements`, async (request, reply) => {
    const member = memberOrDeny(request, reply);
    if (member === undefined) return reply;

    const parsed = parseSettlementBody(request.body);
    if (!parsed.ok) {
      return reply.code(400).send(errorEnvelope(parsed.code, parsed.detail));
    }

    // The dignity floor is read SERVER-SIDE through the seam — never from the
    // request. Even a `dignity_floor` in the body was ignored by the parser.
    const dignityFloorPaise = await deps.floor.dignityFloorPaise(member);

    const allocation = allocateWage({
      wagePaise: parsed.wagePaise,
      dignityFloorPaise,
      claims: parsed.claims,
      cause: parsed.cause,
    });

    // Deferred claims carry forward (ADR-0012): record them as arrears. The
    // waived membership fee is already excluded (it is not in `arrears`).
    // Recording only — recovery of arrears from a future wage is OD-7 and is not
    // done here.
    const settlementId = randomUUID();
    const arisenOn = now().toISOString().slice(0, 10);
    await deps.arrears.record(
      arrearsFrom(allocation, {
        membershipId: member,
        settlementId,
        arisenOn,
        id: (category) => `${settlementId}:${category}`,
      }),
    );

    return reply.code(200).send(allocationDto(allocation));
  });
}
