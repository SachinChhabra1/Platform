# Nia Platform — Team Onboarding

How to get the codebase running (backend + member app) on a fresh Mac.

## 0. Clone to a NO-SPACE path
The iOS build breaks if the project path contains a space (the "Prepare Flutter Framework Script" fails to copy `Flutter.framework`). Clone somewhere like `~/dev/nia`, **not** `~/Desktop/Nia Development`.
```bash
git clone <repo-url> ~/dev/nia && cd ~/dev/nia
```

## 1. Prerequisites
- **Node** + **corepack** (pnpm is invoked as `corepack pnpm` — no separate pnpm install needed).
- **Flutter 3.44.4** (stable) for the member app.
- **Xcode 26+** (only for building the iOS app on a device).

## 2. Backend — `services/wallet`
```bash
cd services/wallet
corepack pnpm install
# config: copy the example configs and fill real values
cp ../../deploy/.env.example ../../deploy/.env    # set POSTGRES_*, NIA_SERVICE_TOKENS, etc.
cp ../../deploy/config/member-directory.example.json ../../deploy/config/member-directory.json
# run (file store, no Postgres needed for local dev):
NIA_STORE=file PORT=8081 HOST=0.0.0.0 \
  NIA_FLOOR_CONFIG_PATH=../../deploy/config/floor.json \
  NIA_OPERATOR_CONFIG_PATH=../../deploy/config/operators.json \
  NIA_MEMBER_DIRECTORY_CONFIG_PATH=../../deploy/config/member-directory.json \
  corepack pnpm start
# health check:
curl http://localhost:8081/v1/health   # -> 200
```
A session token (for the app) is minted via:
```bash
curl -X POST http://localhost:8081/v1/sessions -H "Content-Type: application/json" \
  -H "Idempotency-Key: dev-$(date +%s)" \
  -d '{"phone":"<a phone in member-directory.json>","device_id":"dev-1"}'
# -> { "token": "sess-..." }
```

## 3. Member app — `apps/member`
Platform folders (`ios/`, `android/`, …) are **not committed** — regenerate them per machine.
```bash
cd apps/member
flutter pub get
flutter create --org com.nia.member --project-name member .   # regenerates ios/android/etc
# run on a connected device (replace <device-id>, <mac-lan-ip>, <token>):
flutter run -d <device-id> \
  --dart-define=NIA_API_BASE_URL=http://<mac-lan-ip>:8081 \
  --dart-define="NIA_MEMBER_TOKEN=<token>"
```
First install on a physical iPhone needs a one-time cert trust: Settings → General → VPN & Device Management → trust the developer cert.

## 4. Read before writing code
- `PRODUCT_ARCHITECTURE.md` — system + screen architecture.
- `DESIGN_SYSTEM_LOCK.md` — the locked design system; read before any UI change.
- `backups/UAT-DISTRIBUTION-PLAN.md` — how UAT builds are distributed (TestFlight).
- `backups/SESSION-HANDOVER.md` — latest working state.

## Signing / distribution (iOS)
- Team ID `QBDL5CV5VU`; bundle id `com.nia.member.member`.
- Remote UAT/TestFlight requires the paid Apple Developer Program (enrolled 2026-07-05).
