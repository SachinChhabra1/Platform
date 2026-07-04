# Doc-link self-test fixture

This file is **not** documentation. It exists only so
`scripts/check-doc-links.selftest.mjs` can prove the doc-link gate is fail-closed.

It plants one deliberately broken relative link:

[a link that must not resolve](./this-target-does-not-exist.md)

...and one that does resolve, so the self-test also confirms the checker doesn't
flag good links:

[the lib it tests](../doclinks.mjs)

The real gate (`check-doc-links.mjs`) skips the `__doclink_fixtures__` directory,
so this planted break never fails the normal build.
