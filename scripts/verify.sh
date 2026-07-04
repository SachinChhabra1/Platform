#!/usr/bin/env bash
# Local mirror of CI (.github/workflows/ci.yml). Runs every check the installed
# toolchain allows and reports honestly what it skipped. Exit non-zero on any
# failure. This is the command to run before opening a PR.
set -uo pipefail
fail=0

if command -v node >/dev/null 2>&1; then
  echo "▶ lint gates self-test (fail-closed)"
  node scripts/lint/selftest.mjs || fail=1
  echo "▶ lint gates (clean source)"
  node scripts/lint/run.mjs || fail=1
else
  echo "⊘ node not found — skipping lint gates (install Node 20; see .nvmrc)"
fi

if command -v npx >/dev/null 2>&1; then
  echo "▶ api contract lint"
  # Lint every committed OpenAPI spec via a glob — self-maintaining, so a new
  # spec is gated the moment it lands (an explicit list drifted once: sessions
  # was added but never gated).
  npx --yes @redocly/cli@1.25.0 lint packages/types/openapi/openapi.*.yaml || fail=1
else
  echo "⊘ npx not found — skipping API contract lint"
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "▶ typescript tests"
  pnpm -r --if-present test || fail=1
  echo "▶ typescript typecheck"
  pnpm -r --if-present typecheck || fail=1
else
  echo "⊘ pnpm not found — skipping TypeScript tests"
fi

if command -v flutter >/dev/null 2>&1; then
  for dir in packages/i18n apps/member; do
    if [ -f "$dir/pubspec.yaml" ]; then
      echo "▶ flutter analyze ($dir)"
      (cd "$dir" && flutter analyze) || fail=1
      echo "▶ flutter test ($dir)"
      (cd "$dir" && flutter test) || fail=1
    fi
  done
else
  echo "⊘ flutter not found — skipping Flutter analyze/test"
fi

if [ "$fail" -eq 0 ]; then
  echo "✓ verify passed"
else
  echo "✗ verify failed"
fi
exit "$fail"
