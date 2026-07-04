// Doc-link integrity gate. Walks every hand-authored Markdown file and checks
// that each relative link resolves to a file that exists. The repo is
// documentation-governed (Constitution, ADRs, the OD decision book, the
// engineering lock) and its governance chain is a web of cross-links — a broken
// relative link is silent rot in that chain, so it fails the build.
//
// Scope: hand-authored docs only. Generated output (packages/types/generated/**)
// is machine-owned — its links are the generator's concern, not ours — so it is
// skipped along with the usual build/vendor dirs.
//
// Checks relative links only. External (http/https/mailto) and pure in-page
// anchors (#section) are out of scope. A link's #anchor and optional "title"
// are stripped before the file is resolved.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, normalize, dirname } from "node:path";

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".dart_tool",
  "coverage",
  "generated", // packages/types/generated/** — machine-owned openapi output
]);

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function targetPath(raw) {
  // Strip a trailing `"title"` if present, then the #anchor.
  const noTitle = raw.trim().split(/\s+/)[0];
  return noTitle.split("#")[0];
}

const root = ".";
const broken = [];
let checked = 0;

for (const file of walk(root)) {
  const dir = dirname(file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(line)) !== null) {
      const raw = m[1];
      if (/^(https?:|mailto:|#)/.test(raw.trim())) continue;
      const path = targetPath(raw);
      if (!path) continue; // pure in-page anchor
      checked++;
      const resolved = normalize(join(dir, path));
      try {
        statSync(resolved);
      } catch {
        broken.push(`${file}:${i + 1}  →  ${raw}`);
      }
    }
  });
}

if (broken.length > 0) {
  console.error(`✗ ${broken.length} broken doc link(s) of ${checked} checked:\n`);
  for (const b of broken) console.error(`  ${b}`);
  process.exit(1);
}

console.log(`✓ doc links clean (${checked} relative links resolve)`);
