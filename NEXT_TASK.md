# Next task

The single task the next session should pick up. Kept in sync with [`ROADMAP.md`](ROADMAP.md).

## Status: BLOCKED — awaiting a Founder gate

There is **no unlocked task** right now. The five-screen OS is complete and **frozen for the
board meeting**, and every forward task is gated:

- **R1 (craftsmanship backlog)** — deferred by the Founder until *after* the board meeting.
  This is the most likely next task. It unlocks the moment the Founder says the board meeting
  is done (or "start the backlog").
- **R2 (native install)** — needs a Founder "build the native app" + device/accounts.
- **R3–R8 (backend flows)** — need the backend un-paused *and* the matching OD-# ruled
  (`DECISIONS.md`, OD-1…OD-6).

## What unblocks the loop

One line from the Founder is enough, e.g. **"board's done, start R1"** or **"build the
Android install (R2)"** or **"un-pause backend, OD-1 ruling is X — do R3"**.

## When picked up

Follow the loop: recover context (this file, `ROADMAP.md`, `PROJECT_STATUS.md`,
`DESIGN_SYSTEM_LOCK.md`, `PRODUCT_ARCHITECTURE.md`), write an implementation contract, build
the agreed slice only, verify to green (`nia verify`), audit, update state docs, commit,
bundle.

For **R1** specifically: build onto the existing shared components; do **not** redesign the
frozen screens; regenerate + compare goldens; keep each pillar's emotion intact
(Work Hope · Living Relief · Store Satisfaction · Family Purpose · NiaBook Truth).
