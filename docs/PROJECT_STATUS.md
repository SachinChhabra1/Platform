# Project status

The factual handover state for the next session. This is **not** methodology — it is the
current state of the repository. The repository, not any conversation, is the memory.

## Current milestone

**Foundation complete.**

## Current tag

`v0.1-foundation`

## Current product status

- **Membership is in Founder Review.**
- **No Product Specification is Engineering-Locked yet.**

## Current engineering status

- Repository foundation: **complete**.
- Local verification (`pnpm run verify`): **complete**.
- CI verification: **complete**.
- API contract foundation (`packages/types`, OpenAPI base): **complete**.
- Member Flutter shell (`apps/member`): **complete**.
- i18n foundation (`packages/i18n`): **complete**.
- Logging / PII redaction (`packages/log`): **complete**.
- Fastify: **approved** as the backend implementation choice; recorded in
  [`docs/engineering-stack.md`](engineering-stack.md) (not an ADR).
- **No backend runtime built yet.**
- **No production feature built yet.**

## Current blocker

**Membership Founder Review.**

## Next engineering sequence (after Membership reaches Engineering Lock)

1. Fastify runtime skeleton.
2. Membership service.
3. Wallet Overview backend.
4. Wallet Overview frontend.

## Verification command

```bash
pnpm run verify
```

## Rules for the next session

The next Claude session must:

1. Read [`docs/SESSION-START.md`](SESSION-START.md).
2. Read this file (`docs/PROJECT_STATUS.md`).
3. Read the ADR index ([`docs/adr/README.md`](adr/README.md)).
4. Read the Product Specification register ([`docs/product/README.md`](product/README.md)).
5. Read the Membership Product Specification
   ([`docs/product/0001-membership-strawman-spec.md`](product/0001-membership-strawman-spec.md)).
6. Produce a short understanding report.
7. Wait for Founder/Product instruction **unless** Membership has already reached
   Engineering Lock.
