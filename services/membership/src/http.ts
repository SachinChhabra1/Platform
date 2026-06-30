/// HTTP adapter for the Membership service (spec 0001 §14; contract:
/// packages/types/openapi/openapi.membership.yaml).
///
/// A read-only driving adapter over the Membership domain + `MembershipRepository`
/// port (ports & adapters): it drives NO lifecycle transitions and holds no
/// policy. It resolves the Member from the session and maps the domain
/// `Membership` to the minimal Member-facing wire view — identity + lifecycle
/// state, and deliberately NO tenure (FD-3, Q4) and no operational metadata.
/// Request logging and the lifecycle belong to `@nia/runtime`'s `createServer`.

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import type { Membership } from './membership.js';
import type { MembershipRepository } from './repository.js';

export interface MembershipRouteDeps {
  /** Read-only access to stored Memberships (the port). */
  readonly repository: MembershipRepository;
  /** Clock for the server-time header. Injectable for tests. */
  readonly now?: () => Date;
}

// Wire shape (snake_case contract). Minimal and Member-facing — identity + state
// only; tenure is internal (FD-3, Q4) and is never mapped here.
interface MembershipViewDto {
  readonly membership_id: string;
  readonly name: string;
  readonly state: Membership['state'];
}

function viewDto(membership: Membership): MembershipViewDto {
  return {
    membership_id: membership.identity.membershipId,
    name: membership.identity.name,
    state: membership.state,
  };
}

/** The Nia error envelope (base contract `#/components/schemas/Error`). */
function errorEnvelope(code: string, message: string) {
  return { code, message, correlation_id: randomUUID() };
}

/**
 * Resolve the Member from the session. PRE-AUTH STUB (cf. the Wallet surface):
 * real sessions are phone-first, device-bound opaque bearer tokens (Book VIII
 * §1.3); until that slice lands, the bearer token IS the membership id.
 * Default-deny: no token, no Membership (Book VIII §1.4).
 */
function memberFrom(request: FastifyRequest): string | undefined {
  const header = request.headers.authorization;
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  return token && token.length > 0 ? token : undefined;
}

/**
 * Registers the read-only Membership route on an existing app (built by
 * `@nia/runtime`'s `createServer`): GET /membership/me → the signed-in Member's
 * identity + lifecycle state. Every response carries `X-Nia-Server-Time`; every
 * error carries the Nia envelope.
 */
export function registerMembershipRoutes(
  app: FastifyInstance,
  deps: MembershipRouteDeps,
): void {
  const now = deps.now ?? (() => new Date());

  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.hasHeader('X-Nia-Server-Time')) {
      reply.header('X-Nia-Server-Time', now().toISOString());
    }
    return payload;
  });

  app.setErrorHandler(async (_error, _request, reply: FastifyReply) => {
    return reply
      .code(500)
      .send(errorEnvelope('internal_error', 'An unexpected error occurred.'));
  });

  app.get('/membership/me', async (request, reply) => {
    const member = memberFrom(request);
    if (!member) {
      return reply
        .code(401)
        .send(errorEnvelope('unauthorized', 'Missing or invalid session.'));
    }
    const membership = await deps.repository.findById(member);
    if (!membership) {
      return reply
        .code(404)
        .send(errorEnvelope('not_found', 'No Membership for this session.'));
    }
    return reply.code(200).send(viewDto(membership));
  });
}
