// Doc-link integrity gate — the CLI half (cf. scripts/lint/run.mjs).
// Checks every hand-authored Markdown file in the repo; exits non-zero on any
// broken relative link. Proven fail-closed by scripts/check-doc-links.selftest.mjs.

import { collectBrokenLinks } from "./doclinks.mjs";

const { broken, checked } = collectBrokenLinks(["."]);

if (broken.length > 0) {
  console.error(`✗ ${broken.length} broken doc link(s) of ${checked} checked:\n`);
  for (const b of broken) console.error(`  ${b}`);
  process.exit(1);
}

console.log(`✓ doc links clean (${checked} relative links resolve)`);
