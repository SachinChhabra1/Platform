# scripts/lint/__fixtures__

**Purpose:** Planted violations — NOT real source. `selftest.mjs` scans this folder and
asserts every lint gate catches its violation, proving the gates are fail-closed.
This folder is excluded from the real-source scan in `run.mjs`.
**Owner:** _unassigned_
**Nia OS books:** Book V §4 (testing discipline).
**Local setup:** none.
**Testing:** Consumed by `scripts/lint/selftest.mjs`.
