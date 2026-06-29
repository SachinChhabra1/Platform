import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { rules } from "./rules.mjs";

const ALWAYS_SKIP = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".dart_tool",
]);

// Walk `root`, returning every file path with an extension any rule cares about.
function walk(root, skipDirs) {
  if (!existsSync(root)) return [];
  const out = [];
  for (const entry of readdirSync(root)) {
    if (ALWAYS_SKIP.has(entry) || skipDirs.has(entry)) continue;
    const full = join(root, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full, skipDirs));
    else out.push(full);
  }
  return out;
}

// Returns an array of { ruleId, file, line, text, message }.
export function scan(roots, { skipDirs = new Set() } = {}) {
  const violations = [];
  for (const root of roots) {
    for (const file of walk(root, skipDirs)) {
      const ext = extname(file);
      const applicable = rules.filter((r) => r.exts.includes(ext));
      if (applicable.length === 0) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((text, i) => {
        for (const rule of applicable) {
          if (rule.pattern.test(text)) {
            violations.push({
              ruleId: rule.id,
              file,
              line: i + 1,
              text: text.trim(),
              message: rule.message,
            });
          }
        }
      });
    }
  }
  return violations;
}
