# Known bugs & limitations

Grounded in the repository at HEAD `795b0de`. "Bug" = defect in shipped behaviour;
"limitation" = a known boundary of the current build. Verified state: `flutter analyze`
clean, 49 tests pass, no codegen drift, zero `TODO/FIXME/HACK` in `apps/member/lib`.

## Open

| # | Type | Description | Severity | Notes |
|---|------|-------------|----------|-------|
| K1 | Limitation | No native app. The Member app builds for **web only** — there are no `ios/`, `android/`, or `macos/` runner projects. It runs in a browser (Add-to-Home-Screen approximates an app). | Medium | Blocks handing a board member a native install. Roadmap R2. Deliberate for the demo. |
| K2 | Limitation | Demo hosting is a **temporary** cloudflared tunnel + a local `python3 -m http.server` on this Mac. No permanent HTTPS host. URL dies on Mac sleep/reboot. | Medium | Fine for the board demo; not production hosting. Managed hosting (Firebase/Netlify/CF Pages) needs an interactive login the automated session can't perform. |
| K3 | Limitation | Backend money-movement flows are **not built** (paused). The board build is offline, using Founder-accepted sample figures. | Expected | By design in Product Polish. Roadmap R3–R8, gated on OD-1…OD-6. |

## Closed

- Store data incoherence (today's savings double-counted as the month figure; SKU sums not
  matching the basket total) — fixed in the Store hardening (`ba6b60d`): today ₹63 (basket
  sums to ₹63), month ₹185, year ₹2,460.

## Not bugs (by design)

- Pillar headers carry only title + SOS (no month/language) — the approved design; NiaBook
  owns the full chrome. See `DESIGN_SYSTEM_LOCK.md`.
- `features/wallet/*` still exists but is **unwired** — legacy, not part of the OS shell.
  Removal is not scheduled (tests still reference it; no benefit before the board).
