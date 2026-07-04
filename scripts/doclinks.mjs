// Doc-link integrity — the library half (cf. scripts/lint/scan.mjs).
//
// Walks Markdown under the given roots and returns every relative link that does
// not resolve to a file that exists. The repo is documentation-governed
// (Constitution, ADRs, the OD decision book, the engineering lock) and its
// governance chain is a web of cross-links — a broken relative link is silent rot.
//
// Scope: relative links only. External (http/https/mailto) and pure in-page
// anchors (#section) are out of scope. A link's #anchor and optional "title" are
// stripped before the file is resolved. Generated output and build/vendor dirs
// are skipped by default (machine-owned, not ours to keep green).

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, normalize, dirname } from "node:path";

export const DEFAULT_SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".dart_tool",
  "coverage",
  "generated", // packages/types/generated/** — machine-owned openapi output
  "__doclink_fixtures__", // planted broken links for the self-test — never the real gate
]);

const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

function walk(dir, skipDirs) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (skipDirs.has(entry)) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full, skipDirs));
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

function targetPath(raw) {
  // Strip a trailing `"title"` if present, then the #anchor.
  const noTitle = raw.trim().split(/\s+/)[0];
  return noTitle.split("#")[0];
}

// Returns { broken: string[], checked: number }.
export function collectBrokenLinks(roots, { skipDirs = DEFAULT_SKIP_DIRS } = {}) {
  const broken = [];
  let checked = 0;
  for (const root of roots) {
    for (const file of walk(root, skipDirs)) {
      const dir = dirname(file);
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        let m;
        LINK_RE.lastIndex = 0;
        while ((m = LINK_RE.exec(line)) !== null) {
          const raw = m[1];
          if (/^(https?:|mailto:|#)/.test(raw.trim())) continue;
          const path = targetPath(raw);
          if (!path) continue; // pure in-page anchor
          checked++;
          try {
            statSync(normalize(join(dir, path)));
          } catch {
            broken.push(`${file}:${i + 1}  →  ${raw}`);
          }
        }
      });
    }
  }
  return { broken, checked };
}
