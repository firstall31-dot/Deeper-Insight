---
name: Cache + Invalidation Pattern
description: How the in-memory TTL cache works and which routes must invalidate it.
---

The api-server uses a simple in-memory TTL cache at `artifacts/api-server/src/lib/cache.ts`.

**Cache keys and TTLs:**
- `dashboard:summary`, `dashboard:alerts` — 30 s
- `reports:sales:*`, `reports:profit:*`, `reports:inventory` — 120 s
- `treasury:summary` — 30 s

**Invalidation prefixes:**
- Any sale mutation → `cache.invalidatePrefix("dashboard:")`, `cache.invalidatePrefix("reports:")`, `cache.invalidatePrefix("treasury:")`
- Expense create/delete → `dashboard:`, `reports:`
- Product create/update/delete → `dashboard:`, `reports:`
- Installment create/update → `dashboard:`
- Maintenance create/update → `dashboard:`
- Wallet/bank transactions → `cache.del("treasury:summary")`
- Fawry balance/transactions → `treasury:`, `dashboard:`

**Why:** Dashboard used to SELECT all rows and filter in JS — terrible at scale. SQL aggregations + short TTL gives fast response without re-querying on every poll.

**How to apply:** Every POST/PATCH/DELETE route that touches sales, products, expenses, installments, maintenance, wallets, banks, or fawry must call the appropriate cache invalidation after the DB write.
