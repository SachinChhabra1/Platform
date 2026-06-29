# ADR-0012 — Backend HTTP framework: Fastify

| | |
|---|---|
| **Status** | Accepted |
| **Owner** | AI Engineer (recommendation) · approved by Founder |
| **Date** | 2026-06-29 |
| **Nia OS references** | Book V §2.6 (boring), §2.8 (cluster services); Book VIII §1.7, §4.7; ADR-0005, ADR-0007 |

## Context
Backend services are TypeScript (ADR-0005) and the API is OpenAPI-first (ADR-0007). They
need an HTTP framework to host the cross-cutting middleware Nia requires — idempotency
(§1.7), the error envelope (§4.7), audit, and request logging (`@nia/log`). The framework
is selected now; **building it is deferred** by a Founder product-prioritisation decision:
the current bottleneck is Membership Founder Review, not engineering.

## Problem
Which HTTP framework do Nia backend services use?

## Options considered
1. **Express** — ubiquitous but dated, weaker TypeScript, callback-style.
2. **Fastify** — boring and battle-tested, schema-first, strong TypeScript, plugin model.
3. **Hono** — modern and light, but newer and less proven for a money system.
4. **NestJS** — batteries-included but heavy, decorator-magic, more abstraction.

## Decision
**Fastify** is the backend HTTP framework for Nia. The runtime skeleton is **not built
yet**; the selection is recorded now so the path is unblocked the moment the Membership
spec reaches Engineering Lock.

## Reasoning
Boring and battle-tested (Book V §2.6); schema-first, which aligns with the OpenAPI-first
contract (ADR-0007) and allows request/response validation against it; strong TypeScript
with minimal abstraction; a plugin model that fits the cross-cutting middleware cleanly.
More robust than Express, more proven than Hono, lighter than NestJS.

## Consequences
- When Membership reaches Engineering Lock, the critical path is, in order:
  1. **Fastify runtime skeleton** — health endpoint, error-envelope + idempotency +
     request-logging middleware, served per the OpenAPI base. No product behaviour.
  2. **Membership service.**
  3. **Wallet Overview backend.**
  4. **Wallet Overview frontend.**
- Until Membership locks, no runtime is built — this is a product-prioritisation
  decision, not an engineering gate.
