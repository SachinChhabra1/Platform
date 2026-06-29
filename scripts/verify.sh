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
  npx --yes @redocly/cli@1.25.0 lint packages/types/openapi/openapi.base.yaml || fail=1
else
  echo "⊘ npx not found — skipping API contract lint"
fi

if [ "$fail" -eq 0 ]; then
  echo "✓ verify passed"
else
  echo "✗ verify failed"
fi
exit "$fail"
