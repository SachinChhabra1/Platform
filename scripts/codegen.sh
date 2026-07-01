#!/usr/bin/env bash
# Generate the API clients from the OpenAPI contract (ADR-0007: one contract,
# generated clients). Run via `pnpm --filter @nia/types run generate`.
#
# We invoke the pinned OpenAPI Generator JAR directly with `java -jar`. The npm
# launcher @openapitools/openapi-generator-cli@2.39.0 crashes under Node 20 with
# ERR_REQUIRE_ESM before it can run; the JAR it would have fetched is the actual
# generator, and the pinned version matches packages/types/.openapitools.json.
# TypeScript types come from openapi-typescript (pure Node, no JVM).
#
# Output (packages/types/generated/) is committed — a fresh clone and the verify
# gate need it without a JDK; regenerate here and CI checks drift.
set -euo pipefail

here="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo="$(cd -P "$here/.." && pwd)"
kit_cache="$(cd -P "$repo/.." && pwd)/cache/openapi-generator"
gen_ver="7.10.0"
jar="$kit_cache/openapi-generator-cli-$gen_ver.jar"
types="$repo/packages/types"
# Output base dir. Defaults to the committed location; override (NIA_CODEGEN_OUT)
# to generate into a throwaway dir — used by `nia verify`'s drift check so it can
# compare against the working tree WITHOUT ever writing to or reverting it.
out="${NIA_CODEGEN_OUT:-$types/generated}"

command -v java >/dev/null 2>&1 || {
  echo "java not found — run scripts/bootstrap.sh first (it provisions the JDK)." >&2
  exit 1
}

mkdir -p "$kit_cache"
if [ ! -f "$jar" ]; then
  echo "Fetching OpenAPI Generator $gen_ver ..."
  curl -fsSL -o "$jar" \
    "https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/$gen_ver/openapi-generator-cli-$gen_ver.jar"
fi

mkdir -p "$out" "$out/ts"
# pnpm-based tools (redocly, openapi-typescript) run from packages/types and
# handle spaces in paths fine.
cd "$types"

echo "▶ Joining contracts (base + features) → $out/nia.combined.yaml"
# One client for the whole API (ADR-0007): merge the base contract and every
# feature surface into a single self-contained doc, then generate from it.
pnpm exec redocly join \
  openapi/openapi.base.yaml \
  openapi/openapi.wallet.yaml \
  openapi/openapi.membership.yaml \
  openapi/openapi.sessions.yaml \
  -o "$out/nia.combined.yaml" >/dev/null

echo "▶ Dart client → $out/dart"
rm -rf "$out/dart"
# The Java generator parses -i as a URI and chokes on spaces, so run it from
# inside the output dir and reference the combined spec by its relative name.
( cd "$out" && java -jar "$jar" generate \
    -i nia.combined.yaml \
    -g dart \
    -o dart \
    --additional-properties=pubName=nia_api,pubVersion=1.0.0 \
    --global-property=apiTests=false,modelTests=false,apiDocs=false,modelDocs=false )

echo "▶ TypeScript types → $out/ts/schema.d.ts"
pnpm exec openapi-typescript "$out/nia.combined.yaml" -o "$out/ts/schema.d.ts"

echo "✓ codegen complete (output: $out)"
