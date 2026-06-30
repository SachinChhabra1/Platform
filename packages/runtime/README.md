# @nia/runtime

**Purpose:** The Fastify HTTP runtime skeleton shared by Nia backend services
(`docs/engineering-stack.md`; spec `0001` §14, step 1). It boots a Fastify
instance, serves a `/v1/health` liveness route (under the contract's `API_PREFIX`),
and routes **all** request logging
through [`@nia/log`](../log) so a Member personal identifier can never reach a
log sink unredacted (Book V §5.2).

**Runtime only.** No product behaviour, no APIs, no persistence, no Membership
logic. Services compose `createServer` and add their own routes.

**Nia OS books:** Book V (engineering; §5.2 logging/redaction), VIII (backend
posture).

## Usage

```ts
import { createServer } from '@nia/runtime';

const app = createServer({ serviceName: 'membership' });
await app.listen({ host: '127.0.0.1', port: 8080 });
```

`createServer(options)` returns a configured `FastifyInstance`; the caller owns
`listen` / `close`. Inject a `@nia/log` logger via `options.logger` in tests to
capture emitted lines.

## Boot it

```bash
pnpm --filter @nia/runtime start     # honours PORT / HOST / SERVICE_NAME
curl -s localhost:8080/v1/health     # {"status":"ok","service":"nia-runtime",...}
```

## Verify

```bash
pnpm --filter @nia/runtime test       # vitest (health, real HTTP boot, logging)
pnpm --filter @nia/runtime typecheck  # tsc --noEmit
```

Both run as part of the repo gate, `pnpm run verify`.
