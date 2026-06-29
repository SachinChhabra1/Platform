/// The runtime health route.
///
/// A liveness probe only: it proves the process is up and serving. It carries
/// no Member data and no product behaviour (spec 0001 §14 step 1). Readiness
/// (database, downstream rails) belongs to later slices that own those deps.

import type { FastifyInstance } from 'fastify';

export interface HealthRouteOptions {
  /** Service name echoed back so a probe can tell which service answered. */
  readonly serviceName: string;
}

/** Registers `GET /health`, returning `{ status: 'ok', service, uptimeMs }`. */
export function registerHealthRoute(
  app: FastifyInstance,
  options: HealthRouteOptions,
): void {
  const startedAt = Date.now();
  app.get('/health', async () => ({
    status: 'ok' as const,
    service: options.serviceName,
    uptimeMs: Date.now() - startedAt,
  }));
}
