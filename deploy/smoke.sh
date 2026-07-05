#!/usr/bin/env bash
# Live-backend smoke: health + login + the Member/rail money flows against a
# RUNNING wallet instance. The exhaustive proof is the vitest e2e
# (services/wallet/src/e2e_smoke.test.ts); this is the deploy-time sanity check.
#
# Usage:
#   BASE_URL=http://localhost:8081 \
#   UAT_PHONE=+919000000001 \
#   NIA_SERVICE_TOKEN=<the service token you set in .env> \
#   ./smoke.sh
#
# Requires: bash, curl. (No jq — the token is parsed with grep/sed.)
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8081}"
UAT_PHONE="${UAT_PHONE:-+919000000001}"
DEVICE_ID="${DEVICE_ID:-dev-smoke}"
NIA_SERVICE_TOKEN="${NIA_SERVICE_TOKEN:-}"

pass() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; exit 1; }

# Extract a top-level JSON string field without jq.
json_field() { sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p"; }

echo "▶ Nia wallet smoke — ${BASE_URL}"

# 1. Health ------------------------------------------------------------------
health="$(curl -fsS "${BASE_URL}/v1/health")" || fail "health endpoint unreachable"
echo "${health}" | grep -q '"status":"ok"' && pass "health: ok" || fail "health not ok: ${health}"

# 2. Login (phone-first issuance) -------------------------------------------
login="$(curl -fsS -X POST "${BASE_URL}/v1/sessions" \
  -H 'content-type: application/json' -H 'idempotency-key: smoke-login-1' \
  -d "{\"phone\":\"${UAT_PHONE}\",\"device_id\":\"${DEVICE_ID}\"}")" \
  || fail "login failed — is ${UAT_PHONE} in the member directory?"
TOKEN="$(echo "${login}" | json_field token)"
[ -n "${TOKEN}" ] && pass "login: session issued" || fail "no token in login response: ${login}"
AUTH="authorization: Bearer ${TOKEN}"

# 3. Wage settlement (Floor must be configured) ------------------------------
wage="$(curl -fsS -X POST "${BASE_URL}/v1/wage/settlements" -H "${AUTH}" -H 'content-type: application/json' -d '{
  "wage": { "minor": 100000, "currency": "INR" },
  "claims": {
    "rent": {"minor":0,"currency":"INR"}, "curry": {"minor":0,"currency":"INR"},
    "remittance": {"minor":0,"currency":"INR"}, "savings": {"minor":0,"currency":"INR"},
    "membership_fee": {"minor":0,"currency":"INR"}, "advance_repayment": {"minor":0,"currency":"INR"}
  }, "cause": "none" }')" || fail "wage settlement failed (is the Floor configured?)"
echo "${wage}" | grep -q '"take_home"' && pass "wage settlement: allocated" || fail "wage response missing take_home: ${wage}"

# 4. Remittance: initiate → rail confirm + settle ----------------------------
rem="$(curl -fsS -X POST "${BASE_URL}/v1/remittances" -H "${AUTH}" -H 'content-type: application/json' \
  -d '{"recipient_id":"fam-smoke","amount":{"minor":500000,"currency":"INR"}}')" || fail "remittance initiate failed"
REM_ID="$(echo "${rem}" | json_field id)"
[ -n "${REM_ID}" ] && pass "remittance: initiated (${REM_ID})" || fail "no remittance id: ${rem}"
if [ -n "${NIA_SERVICE_TOKEN}" ]; then
  for step in sent recipient-available settled; do
    curl -fsS -X POST "${BASE_URL}/v1/rail/remittances/${REM_ID}/${step}" \
      -H "x-nia-service-token: ${NIA_SERVICE_TOKEN}" >/dev/null || fail "rail ${step} failed"
  done
  final="$(curl -fsS "${BASE_URL}/v1/remittances/${REM_ID}" -H "${AUTH}")"
  echo "${final}" | grep -q '"state":"settled"' && pass "remittance: settled via rail" || fail "remittance not settled: ${final}"
else
  echo "  · skipping rail steps (set NIA_SERVICE_TOKEN to exercise them)"
fi

# 5. RafiQi grant (transparency surface) -------------------------------------
grant="$(curl -fsS -X POST "${BASE_URL}/v1/rafiqi/grants" -H "${AUTH}" -H 'content-type: application/json' \
  -d '{"action_type":"store_swap","cap":{"minor":50000,"currency":"INR"},"ttl_ms":2592000000}')" || fail "rafiqi grant failed"
echo "${grant}" | grep -q '"action_type":"store_swap"' && pass "rafiqi: grant created" || fail "grant response unexpected: ${grant}"

# 6. Offline sync (a money write applies) ------------------------------------
sync="$(curl -fsS -X POST "${BASE_URL}/v1/sync" -H "${AUTH}" -H 'content-type: application/json' \
  -d '{"writes":[{"record":{"id":"smoke-rec-1","record_class":"money","updated_at":"2026-07-04T11:00:00.000Z","payload":{}}}]}')" \
  || fail "sync failed"
echo "${sync}" | grep -q '"outcome":"applied"' && pass "offline sync: write applied" || fail "sync outcome unexpected: ${sync}"

echo "✓ smoke passed"
