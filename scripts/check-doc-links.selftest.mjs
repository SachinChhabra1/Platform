// Proves the doc-link gate is FAIL-CLOSED (cf. scripts/lint/selftest.mjs).
// Runs the checker against a fixture that plants one broken and one good link,
// and asserts it catches exactly the broken one. If detection silently breaks,
// this fails CI before the real gate is trusted.

import { collectBrokenLinks } from "./doclinks.mjs";

const FIXTURES = "scripts/__doclink_fixtures__";

// Point the checker straight at the fixture dir (the default skip list hides it
// from the real gate, but here it is the explicit root, so it is walked).
const { broken, checked } = collectBrokenLinks([FIXTURES], { skipDirs: new Set() });

const caughtPlanted = broken.some((b) => b.includes("this-target-does-not-exist.md"));
const flaggedGood = broken.some((b) => b.includes("doclinks.mjs"));

const problems = [];
if (checked < 2) problems.push(`expected to check ≥2 links, checked ${checked}`);
if (!caughtPlanted) problems.push("did NOT catch the planted broken link (gate is not fail-closed)");
if (flaggedGood) problems.push("wrongly flagged a link that resolves (false positive)");

if (problems.length > 0) {
  console.error("✗ doc-link self-test failed:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log("✓ doc-link self-test passed — gate catches broken links, passes good ones");
