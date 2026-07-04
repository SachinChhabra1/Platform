# Founder Review Queue

Claude does not interrupt the Founder. When a decision is genuinely the Founder's, it is
**recorded here** and work continues elsewhere. Review these in one sitting; a resolved item
becomes a ruling (an ADR or an OD resolution in `DECISIONS.md`) and moves to Resolved.

**Entry format:** Question · Context · Options · Recommendation · Impact · Urgency · Blocking? ·
References.

---

## Open

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

### Q8 — R1 #3: how should per-pillar emotional register be expressed? (Family warmer than Work)
- **Context:** the shared visual language nails "one product," but Family doesn't yet *feel*
  warmer than Work — the difference is carried only by copy. The backlog asks for a tonal shift
  per promise "without breaking the system."
- **Tension:** the obvious lever (a warm colour tint per pillar) would violate a design law —
  "**colour carries state only, never decoration**." So warmth must come from non-colour levers.
- **Options:** (a) softer levers — larger monograms / rounder avatars / more whitespace / lighter
  type on Family; (b) a per-pillar accent within the palette (bends the colour rule — needs a
  ruling); (c) documentary member photography (bigger change); (d) leave as copy-only for now.
- **Recommendation:** (a) — express warmth through spacing/rounding/typography, not colour. But
  which levers and how far is a **taste call I shouldn't make alone**; several are equally valid.
- **Impact:** touches all four pillars' feel. **Blocking?** Not for other work; blocks R1 #3 only.

### Q9 — R1 #4: what is the daily-return hook (esp. for Living)?
- **Context:** NiaBook and Store earn a daily open; Living earns it least. "Give every pillar a
  reason to come back." A real daily hook is closer to a **new feature** than craftsmanship, so
  it needs a product direction (Engineering Authority forbids inventing features).
- **Options:** (a) surface a daily-changing element (today's meal / community event) — new
  content/feature; (b) lean on the existing "31 days left" countdown as the recurring pull;
  (c) a streak / "days you kept more" motif; (d) a daily "one thing for tomorrow" coaching line
  (from backlog §4) across pillars.
- **Recommendation:** (d) — the coaching line from the backlog (§4 "end with coaching") is the
  most grounded and system-consistent daily nudge, and it already has documented intent. I can
  build (d) if you confirm; the others invent product.
- **Impact:** cross-pillar. **Blocking?** Blocks R1 #4 only.

---

## Resolved

- **Q1 — Lift the board freeze / start R1?** ✅ Resolved 2026-07-04: Founder lifted the freeze
  and said "start R1." R1 is in progress (E4 also unlocked); first slice R1a (○→✓ motion) shipped.
