# Founder Review Queue

Claude does not interrupt the Founder. When a decision is genuinely the Founder's, it is
**recorded here** and work continues elsewhere. Review these in one sitting; a resolved item
becomes a ruling (an ADR or an OD resolution in `DECISIONS.md`) and moves to Resolved.

**Entry format:** Question · Context · Options · Recommendation · Impact · Urgency · Blocking? ·
References.

---

## Open

### Q1 — Lift the board freeze / start the craftsmanship backlog (R1)?
- **Context:** the five screens are frozen for the board demo. R1 (NiaBook ○→✓ motion, per-pillar
  emotional register, daily-return pull) and E4 (SOS/icon-chip dedup) are ready but gated by the freeze.
- **Options:** (a) keep frozen until after the board; (b) lift now and start R1.
- **Recommendation:** keep frozen until you confirm the board is done, then "start R1."
- **Impact:** unlocks the largest in-authority product-quality lane. **Urgency:** high after the board.
- **Blocking?** Yes — gates R1 + E4. **References:** `ROADMAP.md`, `docs/design/niabook/niabook-next-iteration.md`.

### Q2 — Un-pause the backend and rule the open decisions (OD-1…OD-6)?
- **Context:** money-movement flows (Wage/Remittance/RafiQi/Offline/Savings/Floor) are paused; each is
  also blocked by an open decision needing a ruling. ODs expire 2026-07-13.
- **Options:** rule each OD (becomes an ADR) and un-pause, or keep paused through Product Polish.
- **Recommendation:** rule OD-1 first (Wage Flow is the next backend slice) when ready to resume backend.
- **Impact:** unlocks R3–R8. **Urgency:** medium (OD expiry approaching). **Blocking?** Yes — gates backend.
- **References:** `DECISIONS.md` (OD-1…OD-6).

### Q3 — Fate of the legacy/prototype surfaces?
- **Context:** `apps/member/lib/features/` has surfaces not mounted in the OS shell (`home`, `wallet`,
  `profile`, `membership`, `promise`, `clusters`, `family/my_family`). `wallet` uses retired "wallet" language.
- **Options:** fold into the OS · keep as separate flows (auth/recovery clearly stay) · retire.
- **Recommendation:** retire `wallet`/`home` after the board (behind tests); keep auth/recovery; decide the rest per roadmap.
- **Impact:** removes dead surface + drift risk. **Urgency:** low. **Blocking?** No. **References:** `docs/03_PRODUCT_BIBLE.md` (Surfaces not in the frozen OS), `KNOWN_BUGS.md`.

### Q4 — Ratify the Promise headline (FD-2).
- **Context:** anchor is set (protection of money); exact sentence is AI-drafted, pending your ratification.
- **Options:** ratify the drafted sentence · supply your own · defer.
- **Recommendation:** ratify or replace in one line so the Promise surface can be built.
- **Impact:** unblocks the Promise/membership surface. **Urgency:** low. **Blocking?** No (build not started).
- **References:** `DECISIONS.md` (FD-2), `docs/product/0001-membership-strawman-spec.md`.

### Q5 — Product positioning: "surplus / continuity infrastructure" vs. the current framing?
- **Context:** the supplied manual package framed Nia as "compound economic surplus / continuity
  infrastructure." The repo's canon frames it as "help migrant workers keep more and send more home."
  I kept the repo framing and did not merge the surplus language.
- **Options:** keep current framing · adopt/blend the surplus framing (would revise `01_NIA_OS`/PRODUCT_ARCHITECTURE).
- **Recommendation:** keep current framing unless the surplus framing is a deliberate strategic evolution.
- **Impact:** touches top-level product doctrine. **Urgency:** low. **Blocking?** No. **References:** `PRODUCT_ARCHITECTURE.md`.

### Q6 — Doc-org nit: should `04_ARCHITECTURE` be strictly technical?
- **Context:** `04_ARCHITECTURE` currently indexes `PRODUCT_ARCHITECTURE.md` (product doctrine) + engineering-stack, and cross-points to `07_DECISIONS` (ADRs) for technical architecture.
- **Options:** leave as-is (cross-linked) · make `04` strictly technical (ADRs/stack) and route product doctrine only through `03`/`01_NIA_OS`.
- **Recommendation:** leave as-is; it loses nothing. **Impact:** navigation clarity only. **Urgency:** trivial. **Blocking?** No.

### Q7 — Push the repo to a GitHub remote to activate CI?
- **Context:** a comprehensive CI workflow already exists (`.github/workflows/ci.yml`: lint gates,
  OpenAPI contract, TS typecheck+test, Flutter analyze+test). But `origin` is a **local recovery
  bundle**, so CI never actually runs on a runner.
- **Options:** (a) push to a GitHub remote so CI executes on every PR/push; (b) keep bundle-based
  local recovery + local verification (`nia verify`) only.
- **Recommendation:** add a GitHub remote when convenient — the workflow is ready and it makes the
  gates real. Not urgent while `nia verify` runs locally.
- **Impact:** turns configured CI into enforced CI. **Urgency:** low. **Blocking?** No.
  **References:** `.github/workflows/ci.yml`, `ENGINEERING_AUDIT.md`.

---

## Resolved

_(none yet — resolved items move here with the ruling and date.)_
