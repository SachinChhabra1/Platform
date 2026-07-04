# Founder Review Queue

Claude does not interrupt the Founder. When a decision is genuinely the Founder's, it is
**recorded here** and work continues elsewhere. Review these in one sitting; a resolved item
becomes a ruling (an ADR or an OD resolution in `DECISIONS.md`) and moves to Resolved.

**Entry format:** Question · Context · Options · Recommendation · Impact · Urgency · Blocking? ·
References.

---

## Open

*(No open ODs. OD-8 was ruled 2026-07-04 — see Resolved.)*

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

### Q11 — Accessibility on the frozen screens: enlarge sub-48px tap targets / allow text reflow?
- **Context:** R9.4 fixed all golden-neutral accessibility (labels, roles, headers, contrast — passes
  WCAG AA). Remaining: the SOS pill, the NiaBook language/month toggles, and the icon chips are < 48px
  tap targets on the five **frozen** screens, and some fixed-height slots can clip at large system text
  scale. Fixing these changes the goldens.
- **Options:** (a) approve a small screen change to meet the 48px minimum + text reflow (regenerates the
  five goldens once); (b) keep the goldens byte-identical and accept current sizes for now.
- **Recommendation:** (a) when convenient — 48px is the accessibility baseline and the change is minor;
  it just needs your go-ahead to move the goldens. Not urgent for the demo.
- **Impact:** the five goldens regenerate once. **Urgency:** low. **Blocking?** No. **References:**
  `R9_ACCESSIBILITY_AUDIT.md`, `DESIGN_SYSTEM_LOCK.md`.

---

## Resolved

- **OD-8 — Operator money-conflict resolution model.** ✅ Resolved (Founder, 2026-07-04): **Option B** —
  the Operator resolves each money conflict as accept-proposal / keep-server / manual, each an
  authoritative ledger write recording operator + reason; operators authenticate with a per-operator
  credential. [ADR-0019](docs/adr/0019-operator-conflict-resolution.md), **Locked** in
  [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md).
- **OD-7 — Arrears recovery ordering.** ✅ Resolved (Founder, 2026-07-04): **Option B** —
  current-cycle claims first, recover from surplus above the floor oldest-first, capped (config, 50%),
  Nia's own arrears last. [ADR-0018](docs/adr/0018-arrears-recovery-ordering.md), **Locked** in
  [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md); built (R3 fully closed).
- **Q2 — Un-pause the backend and rule OD-1…OD-6.** ✅ Resolved (Founder, 2026-07-04): all six ODs ruled
  (ratified as recommended), each an ADR ([0012–0017](docs/adr/README.md)) and **Locked** in
  [`ENGINEERING_LOCK.md`](ENGINEERING_LOCK.md). **Backend un-paused** (OD-1). The forward path R2–R8 is
  now unblocked and built strictly against the locked decisions; `DECISIONS.md` open-decisions section is
  cleared.
- **Q10 — the `nia-book-design-exploration` (Next.js) UI.** ✅ Resolved (Founder, 2026-07-04): it is a
  **design system / reference only** — it explores visual design, motion, hierarchy, and interaction;
  it is **not** a candidate implementation and does **not** supersede ADR-0002. **Flutter remains the
  canonical client.** Engineering studies the design, extracts principles, and implements them in
  Flutter, preserving the Flutter architecture — **no Founder approval needed when product behaviour is
  unchanged.** Written into `REPOSITORY_CONSTITUTION.md` (tie-break rule 7). No architecture decision
  remains open.

- **Q8 — per-pillar emotional register.** ✅ Approved 2026-07-04: **no colour for emotion**
  (colour stays reserved for state/success/warning/error/progress). Differentiate via typography
  weight, spacing rhythm, copy tone, icon treatment, density, motion timing. Identities: NiaBook
  factual · Living calm/spacious · Work precise/energetic · Family warm/personal. No new palette,
  gradients, illustration, or noise. **Building now (R1 #3).**
- **Q9 — daily-return.** ✅ Approved with refinement 2026-07-04: **reject the daily hook**;
  implement **Continuity Coaching** — at most one contextual next step per screen, only when
  meaningful, never gamified/artificial/DAU-driven. Calm, helpful, optional. **Built:** one
  grounded `CoachingLine` on NiaBook + all four pillars.

- **Q1 — Lift the board freeze / start R1?** ✅ Resolved 2026-07-04: Founder lifted the freeze
  and said "start R1." R1 is in progress (E4 also unlocked); first slice R1a (○→✓ motion) shipped.
