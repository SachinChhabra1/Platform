// Nia CI lint gates (Book V §5.2, Book VI, CLAUDE.md §10–12).
// These are intentionally simple, fail-closed stubs. They will be hardened as
// real source lands. Each rule fires on a line and reports a violation.

export const SOURCE_EXTS = [".ts", ".tsx", ".js", ".mjs", ".dart", ".css"];

export const rules = [
  {
    id: "no-pii-in-logs",
    description:
      "A log line must never contain a Member personal identifier (Book V §5.2).",
    exts: [".ts", ".tsx", ".js", ".mjs", ".dart"],
    pattern:
      /\b(console\.(log|info|warn|error|debug)|logger\.\w+|print)\s*\([^)]*\b(phone|aadhaar|aadhar|otp|dob|date_of_birth|home_address|biometric|recipient_phone)\b/i,
    message: "Personal identifier in a log call. Redact before logging.",
  },
  {
    id: "no-hardcoded-theme",
    description:
      "Theme values live only in packages/tokens (Book VI). No hardcoded colour.",
    exts: [".ts", ".tsx", ".dart", ".css"],
    pattern: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?\b/,
    message: "Hardcoded colour literal. Read it from packages/tokens instead.",
  },
  {
    id: "i18n-required",
    description:
      "Member-facing text must come from packages/i18n, never a raw literal (CLAUDE.md §12).",
    exts: [".ts", ".tsx", ".dart"],
    // Flags a UI text-bearing prop assigned a raw alphabetic string literal not
    // wrapped in a translation call (t(...) / tr(...) / i18n.).
    pattern:
      /\b(label|title|message|placeholder|hint|heading)\s*[:=]\s*["'][A-Za-z][^"']*["']/,
    message: "Raw Member-facing string. Use a key from packages/i18n.",
  },
];
