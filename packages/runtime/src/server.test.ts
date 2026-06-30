import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createLogger } from '@nia/log';
import { createServer } from './server.js';

let server: FastifyInstance | undefined;

afterEach(async () => {
  await server?.close();
  server = undefined;
});

describe('runtime skeleton', () => {
  it('serves GET /v1/health with an ok status', async () => {
    server = createServer({ serviceName: 'test-svc' });
    const response = await server.inject({ method: 'GET', url: '/v1/health' });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('test-svc');
    expect(typeof body.uptimeMs).toBe('number');
  });

  it('actually boots and answers over HTTP', async () => {
    server = createServer({ serviceName: 'test-svc' });
    const address = await server.listen({ host: '127.0.0.1', port: 0 });

    const response = await fetch(`${address}/v1/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });

  it('logs each request through @nia/log (not Fastify pino)', async () => {
    const lines: string[] = [];
    const logger = createLogger({ sink: (line) => lines.push(line) });
    server = createServer({ serviceName: 'test-svc', logger });

    await server.inject({ method: 'GET', url: '/v1/health' });

    expect(lines).toHaveLength(1);
    const record = JSON.parse(lines[0]!);
    expect(record).toMatchObject({
      msg: 'request',
      method: 'GET',
      url: '/v1/health',
      statusCode: 200,
    });
    // Because this path goes through @nia/log, redaction (unit-tested in
    // packages/log) applies to everything the runtime logs.
  });
});
