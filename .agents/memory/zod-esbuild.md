---
name: zod/v4 not bundleable in api-server esbuild
description: Route files in api-server cannot import directly from zod/v4 — esbuild can't resolve the subpath.
---

**Rule:** api-server route files must NOT import `from "zod/v4"` or `from "zod"` directly.

**Why:** esbuild bundles the api-server into a single ESM file. The `zod/v4` subpath export is not resolvable by esbuild's bundler. This causes a build failure: `Could not resolve "zod/v4"`.

**How to apply:**
- Use schemas from `@workspace/api-zod` (generated from OpenAPI spec) for request/response validation.
- For ad-hoc validation in routes that have no spec entry, do manual JS checks (typeof, Array.includes, etc.) instead of importing zod.
- If you must use zod in a route, add the schema to the OpenAPI spec and run codegen instead.
