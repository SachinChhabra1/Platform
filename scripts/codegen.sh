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
spec="$types/openapi/openapi.wallet.yaml"

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

# Run from packages/types so the generator gets RELATIVE, space-free paths — the
# Java generator parses -i as a URI and the kit path contains a space.
cd "$types"

echo "▶ Bundling the contract (inline base \$refs) → generated/wallet.bundled.yaml"
mkdir -p generated
pnpm exec redocly bundle openapi/openapi.wallet.yaml -o generated/wallet.bundled.yaml >/dev/null

echo "▶ Dart client → packages/types/generated/dart"
rm -rf generated/dart
java -jar "$jar" generate \
  -i generated/wallet.bundled.yaml \
  -g dart \
  -o generated/dart \
  --additional-properties=pubName=nia_api,pubVersion=1.0.0 \
  --global-property=apiTests=false,modelTests=false,apiDocs=false,modelDocs=false

echo "▶ TypeScript types → packages/types/generated/ts/schema.d.ts"
pnpm exec openapi-typescript generated/wallet.bundled.yaml -o generated/ts/schema.d.ts

echo "✓ codegen complete"
