/// The Fastify runtime skeleton shared by Nia backend services.
///
/// Boots a Fastify instance, registers the health route, and routes all
/// request logging through `@nia/log` (PII redaction) instead of Fastify's
/// built-in logger — so a personal identifier can never reach a log sink
/// unredacted (Book V §5.2). Runtime only: no product behaviour, no Membership
/// logic (spec 0001 §14 step 1; engineering-stack.md).

import Fastify, { type FastifyInstance } from 'fastify';
import { createLogger, type Logger } from '@nia/log';
import { registerHealthRoute } from './health.js';

export interface CreateServerOptions {
  /** Identifies the service in logs and in the health response. */
  readonly serviceName?: string;
  /**
   * The structured logger requests are recorded through. Defaults to a
   * `@nia/log` logger tagged with the service name. Inject one in tests to
   * capture emitted lines.
   */
  readonly logger?: Logger;
}

const DEFAULT_SERVICE_NAME = 'nia-runtime';

/**
 * Builds a configured Fastify instance: Fastify's own logger is disabled and
 * every request is logged once, on response, through `@nia/log`. The caller
 * owns the lifecycle (`listen`, `close`).
 */
export function createServer(
  options: CreateServerOptions = {},
): FastifyInstance {
  const serviceName = options.serviceName ?? DEFAULT_SERVICE_NAME;
  const log = options.logger ?? createLogger({ base: { service: serviceName } });

  // Fastify's pino logger is off; @nia/log is the sole logging path so that
  // redaction is guaranteed (defense in depth with the no-pii-in-logs gate).
  const app = Fastify({ logger: false, disableRequestLogging: true });

  app.addHook('onResponse', async (request, reply) => {
    log.info('request', {
      reqId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      durationMs: Math.round(reply.elapsedTime),
    });
  });

  registerHealthRoute(app, { serviceName });

  return app;
}
