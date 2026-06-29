// Runs the lint gates over real source roots. Exits non-zero on any violation.
// With no source yet, this passes — proving the repo is clean.
import { scan } from "./scan.mjs";

const ROOTS = ["apps/console", "services", "packages", "infra"];
const SKIP = new Set(["__fixtures__", "tokens", "i18n"]);

const violations = scan(ROOTS, { skipDirs: SKIP });

if (violations.length > 0) {
  console.error(`✗ ${violations.length} lint-gate violation(s):\n`);
  for (const v of violations) {
    console.error(`  [${v.ruleId}] ${v.file}:${v.line}\n    ${v.text}\n    → ${v.message}`);
  }
  process.exit(1);
}

console.log("✓ lint gates clean");
