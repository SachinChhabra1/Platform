# scripts/lint

**Purpose:** The CI lint gates. `rules.mjs` defines them; `scan.mjs` walks files;
`run.mjs` checks real source (must be clean); `selftest.mjs` proves each gate is
fail-closed against `__fixtures__/` (must catch every planted violation).
**Owner:** _unassigned_
**Nia OS books:** Book V §5.2 (logging), Book VI (theme), CLAUDE.md §10–12.
**Local setup:** Node 20. `node scripts/lint/run.mjs`; `node scripts/lint/selftest.mjs`.
**Testing:** `selftest.mjs` is itself the test of the gates.
