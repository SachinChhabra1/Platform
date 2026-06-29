// Proves every gate is FAIL-CLOSED: each rule must fire on the planted fixtures.
// If a rule does not catch its planted violation, the gate is broken — fail CI.
import { scan } from "./scan.mjs";
import { rules } from "./rules.mjs";

const violations = scan(["scripts/lint/__fixtures__"]);
const fired = new Set(violations.map((v) => v.ruleId));

const missing = rules.filter((r) => !fired.has(r.id));

if (missing.length > 0) {
  console.error("✗ self-test failed — these gates did not catch planted violations:");
  for (const r of missing) console.error(`  [${r.id}] ${r.description}`);
  process.exit(1);
}

console.log(`✓ self-test passed — all ${rules.length} gates are fail-closed`);
