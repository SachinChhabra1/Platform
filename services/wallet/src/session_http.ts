/// HTTP adapter for session issuance — LOGIN (spec 0002; contract:
/// packages/types/openapi/openapi.sessions.yaml). Composed into the wallet app so
/// the single UAT process both issues sessions and serves the authed Member
/// surfaces over ONE shared `SessionStore` (the sync store cannot be shared
/// cross-process).
///
/// `POST /v1/sessions` — phone-first re-proof (FD-S1): the device presents the
/// Member's phone + a device id; the phone is resolved through the provisioned
/// `MemberDirectory`; a fresh opaque, device-bound token is issued. Default-deny:
/// an unrecognised phone is never issued a session (security boundary 2 — the
/// number alone is necessary, not sufficient). Issuing revokes the Member's prior
/// device (FD-S3, in the store). Mutating, so `Idempotency-Key` is required (Book
/// VIII §1.7): a retry with the same key replays the SAME token, never a second
/// session. NOT gated by a service token — a login endpoint must be callable by
/// the device itself; the provisioned directory is the control.
///
/// Mirrors `@nia/sessions` (kept wallet-local to avoid a cross-package dependency
/// the offline lockfile can't add); consolidate onto that package when online.

import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { API_PREFIX, type SessionStore } from '@nia/runtime';
import type { MemberDirectory } from './member_directory.js';

export interface SessionRouteDeps {
  /** Resolves a phone to the Member it belongs to (the verification seam). */
  readonly directory: MemberDirectory;
  /** The shared session store the issued token is written into. */
  readonly sessions: SessionStore;
  /** Clock for the server-time header/field. Injectable for tests. */
  readonly now?: () => Date;
}

interface SessionRequestBody {
  readonly phone?: unknown;
  readonly device_id?: unknown;
}

interface SessionIssuedDto {
  readonly token: string;
  readonly scope: 'member';
  readonly server_time: string;
}

function errorEnvelope(code: string, message: string) {
  return { code, message, correlation_id: randomUUID() };
}

/// Registers `POST /v1/sessions`. Every response carries `X-Nia-Server-Time`;
/// every error the Nia envelope.
export function registerSessionRoutes(app: FastifyInstance, deps: SessionRouteDeps): void {
  const now = deps.now ?? (() => new Date());
  // Idempotency (Book VIII §1.7): key → the exact response first returned.
  const seen = new Map<string, SessionIssuedDto>();

  app.addHook('onSend', async (_request, reply, payload) => {
    if (!reply.hasHeader('X-Nia-Server-Time')) {
      reply.header('X-Nia-Server-Time', now().toISOString());
    }
    return payload;
  });

  app.setErrorHandler(async (_error, _request, reply: FastifyReply) => {
    return reply.code(500).send(errorEnvelope('internal_error', 'An unexpected error occurred.'));
  });

  app.post(`${API_PREFIX}/sessions`, async (request, reply) => {
    const key = request.headers['idempotency-key'];
    if (typeof key !== 'string' || key.trim() === '') {
      return reply.code(400).send(errorEnvelope('idempotency_key_required', 'Idempotency-Key is required.'));
    }

    const body = (request.body ?? {}) as SessionRequestBody;
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const deviceId = typeof body.device_id === 'string' ? body.device_id.trim() : '';
    if (phone === '' || deviceId === '') {
      return reply.code(400).send(errorEnvelope('invalid_request', "Both 'phone' and 'device_id' are required."));
    }

    // Idempotent replay: same key → same token, no re-issue (no double revoke).
    const prior = seen.get(key);
    if (prior) return reply.code(201).send(prior);

    const membershipId = deps.directory.resolvePhone(phone);
    if (!membershipId) {
      return reply.code(401).send(errorEnvelope('unauthorized', 'That number is not recognised.'));
    }

    const token = deps.sessions.issue({ membershipId, deviceId, scope: 'member' });
    const dto: SessionIssuedDto = { token, scope: 'member', server_time: now().toISOString() };
    seen.set(key, dto);
    return reply.code(201).send(dto);
  });
}
