---
name: Codegen + Lib rebuild order
description: The exact sequence required after any OpenAPI spec change to avoid stale types.
---

**Sequence after editing lib/api-spec/openapi.yaml:**
1. `pnpm --filter @workspace/api-spec run codegen` — regenerates Zod schemas + React Query hooks
2. `pnpm run typecheck:libs` — rebuilds lib declaration files (tsc --build)
3. Restart the api-server workflow — picks up new generated Zod schemas in the bundle

**Why:** Step 2 is easy to forget. Without it, Vite's dev server tries to import the new generated `.ts` source files but the lib's compiled declarations are stale, causing "Does the file exist?" import errors in the browser console. The api-server also needs restart because it bundles its own copy of the Zod schemas via esbuild.

**How to apply:** Any time you touch openapi.yaml — even to add one field — run all three steps before testing.
