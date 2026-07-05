# Wallet service image (UAT/production). Runs the fully-composed Nia backend
# (login + Member surfaces + rail/ops + Operator reconciliation) over Postgres.
#
# Build context is the REPO ROOT (see docker-compose.yml: context is ..), because
# the wallet is a pnpm workspace member and needs its workspace siblings
# (@nia/runtime, @nia/log, etc.) to install.
FROM node:20-slim

# Tools the entrypoint/healthcheck need.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

# Pin pnpm to the repo's packageManager version.
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

WORKDIR /app
COPY . .

# Install the workspace (frozen — reproducible), then add the Postgres driver the
# offline sandbox could not fetch. `connectPgSqlExecutor` loads `pg` by dynamic
# import, so this is the only place the dependency is introduced.
RUN pnpm install --frozen-lockfile \
  && pnpm --filter @nia/wallet add pg

# Bind to all interfaces inside the container; the host maps the port.
ENV HOST=0.0.0.0
ENV PORT=8081
EXPOSE 8081

# start.ts → bootstrapWalletApp: connects Postgres, runs the idempotent migration,
# composes the app. Config is env-only (see docker-compose.yml / .env).
CMD ["pnpm", "--filter", "@nia/wallet", "start"]
