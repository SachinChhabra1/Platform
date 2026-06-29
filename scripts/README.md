# scripts

**Purpose:** Repository tooling — CI lint gates and developer scripts.
**Owner:** _unassigned_
**Nia OS books:** Book V (§5.2 logging, §4 testing), Book VI (theme), CLAUDE.md §10–12.
**Local setup:** Node 20. `node scripts/lint/run.mjs`, `node scripts/lint/selftest.mjs`.
**Testing:** `lint/selftest.mjs` proves each gate is fail-closed against planted
fixtures; `lint/run.mjs` proves real source is clean.
