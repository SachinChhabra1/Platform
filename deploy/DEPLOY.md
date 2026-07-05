# Nia backend — deploy runbook (Phase 1)

Stands up the fully-composed wallet service (login + Member surfaces + rail/ops +
Operator reconciliation) on PostgreSQL. Designed for a controlled **UAT** deploy;
the same image is the production path.

> **Run this on a networked machine.** The engineering sandbox has no network, no
> Postgres, and no `pg` driver, so it cannot deploy — these are your commands.

## Recommended path — Docker Compose (fastest, no cloud provisioning)

Prereqs: Docker + Docker Compose.

```bash
cd deploy

# 1. Secrets
cp .env.example .env
#    edit .env → set POSTGRES_PASSWORD and NIA_SERVICE_TOKENS to strong values.

# 2. Founder / ops config
cp config/floor.example.json            config/floor.json
cp config/operators.example.json        config/operators.json
cp config/member-directory.example.json config/member-directory.json
#    ⚠️ config/floor.json ships with PLACEHOLDER values that are NOT Founder-approved.
#       Replace them with the ruled Floor numbers before real users (see note below).
#    · operators.json          → { "<operator-credential>": "<operatorId>" }
#    · member-directory.json   → { "<phone>": "<membershipId>" }  (your UAT users)

# 3. Up (builds the image, installs pg, runs migrations on boot, starts the app)
docker compose up --build -d

# 4. Smoke the live backend
NIA_SERVICE_TOKEN="<the token you set in .env>" \
UAT_PHONE="+919000000001" \
BASE_URL="http://localhost:8081" \
./smoke.sh
```

Migrations run automatically on boot (`bootstrapWalletApp` → `runWalletMigrations`,
idempotent `CREATE TABLE IF NOT EXISTS` per store), so there is no separate migrate
step and re-deploys are safe.

## Alternative — bare metal (Node 20 + pnpm, existing Postgres)

```bash
# from the repo root
pnpm install --frozen-lockfile
pnpm --filter @nia/wallet add pg          # the one dependency the sandbox couldn't fetch

export NIA_STORE=postgres
export DATABASE_URL=postgres://USER:PASS@HOST:5432/nia_wallet
export HOST=0.0.0.0 PORT=8081
export NIA_RECOVERY_CAP_BPS=5000
export NIA_SERVICE_TOKENS=<strong-token>
export NIA_FLOOR_CONFIG_PATH=/abs/path/floor.json
export NIA_OPERATOR_CONFIG_PATH=/abs/path/operators.json
export NIA_MEMBER_DIRECTORY_CONFIG_PATH=/abs/path/member-directory.json

pnpm --filter @nia/wallet start
```

## Exit criterion (Phase 1)

`./smoke.sh` passes: health ok, login issues a session, and wage / remittance /
RafiQi / offline-sync flows return the expected shapes against the live DB.

## Notes / limits (read before UAT)

- **Floor is a Founder value.** `config/floor.json` placeholders are labelled
  `PLACEHOLDER-NOT-FOUNDER-APPROVED`. Wage settlement runs against whatever is
  configured — get the ruled numbers in before real users. With **no** Floor file,
  wage settlement refuses to run (by design — it never fabricates a floor).
- **Login is phone-first + provisioned.** Only phones in `member-directory.json`
  can obtain a session; an unrecognised number is refused (401). This is a UAT
  control, not the final consumer-auth model (OTP/SIM strength is a later, spec-
  gated slice).
- **Single instance.** The session store is durable (survives restart) but the
  runtime `SessionStore` interface is synchronous, so sessions are not shared
  across processes — run one wallet instance for UAT. Horizontal scale is a later
  slice (shared-session redesign).
- **Savings withdrawal** needs an account with a balance; deposits arrive
  server-side (no Member deposit endpoint yet), so seed test balances via the
  ledger before exercising withdrawals.
- **Secrets never commit.** `.env` and `config/*.json` are git-ignored; only the
  `*.example` templates are tracked.
