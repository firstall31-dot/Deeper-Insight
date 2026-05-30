# MobilShop Pro — Mobile Shop POS & Management System

A comprehensive bilingual (English / Arabic) Point-of-Sale and shop management system for mobile phone retailers. Covers inventory, sales, IMEI tracking, maintenance, installments, expenses, employees, digital wallets, bank accounts, and Fawry/recharge services.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/mobile-shop run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter, TanStack Query, shadcn/ui, Recharts, Tailwind CSS
- API: Express 5 (contract-first, OpenAPI → Orval codegen)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)
- Languages: Cairo font (Arabic RTL), Inter font (English LTR)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/` — Drizzle ORM schemas (14 domain files)
- `lib/api-zod/src/generated/` — Zod validators generated from spec
- `lib/api-client-react/src/generated/` — React Query hooks generated from spec
- `artifacts/api-server/src/routes/` — Express route handlers (one file per domain)
- `artifacts/mobile-shop/src/pages/` — All 15 page components
- `artifacts/mobile-shop/src/lib/i18n.ts` — English/Arabic translation strings
- `artifacts/mobile-shop/src/contexts/LanguageContext.tsx` — RTL/LTR toggle context

## Modules

| Module | Route | Description |
|---|---|---|
| Dashboard | `/` | KPIs, sales chart, low-stock & maintenance alerts |
| Inventory | `/inventory` | Product stock, pricing, alerts |
| Devices | `/devices` | IMEI tracking, condition, availability |
| Sales | `/sales` | Invoices by payment method |
| Customers | `/customers` | Customer registry, debt tracking |
| Suppliers | `/suppliers` | Supplier registry, purchases/debt |
| Maintenance | `/maintenance` | Repair tickets, status tracking |
| Software | `/software` | Software service orders |
| Installments | `/installments` | Installment plans, payment progress |
| Expenses | `/expenses` | Shop expenses by category |
| Employees | `/employees` | Staff, salary, advances, deductions |
| Wallets | `/wallets` | Digital wallet balances + transactions |
| Banks | `/banks` | Bank account balances + transactions |
| Fawry | `/fawry` | Fawry/recharge balance and transactions |
| Reports | `/reports` | Sales, profit, and inventory charts |

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives all codegen — run `codegen` after any spec change, never edit generated files manually.
- **Numeric → string in DB**: Drizzle `numeric` columns store as strings; always cast with `Number()` in route handlers before sending to client.
- **Express 5 async routes**: All handlers typed `async (req, res): Promise<void>` with early `return` after each `res.json()` call.
- **Single RTL context**: `LanguageProvider` sets `document.dir` and a `language` value — all components read `language === 'ar'` to flip icon positions and text alignment.
- **Wildcard routes in Express 5**: Use `/{*splat}` pattern for catch-all routes; Express 5 does not support `*` as a standalone wildcard.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before editing route or page code.
- After any DB schema change, run `pnpm --filter @workspace/db run push` (dev) — never edit migration files manually.
- `pnpm run dev` at workspace root is intentionally absent; use workflows or `pnpm --filter` instead.
- Numeric DB fields (`numeric` type) come back as strings from Drizzle — always wrap in `Number()`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
