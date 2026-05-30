import { Router } from "express";
import { sql } from "drizzle-orm";
import { db, salesTable, walletsTable, bankAccountsTable, fawryBalanceTable, fawryTransactionsTable } from "@workspace/db";
import { cache, TTL } from "../lib/cache";

const router = Router();

/**
 * GET /api/treasury/summary
 * Unified overview of all cash positions across payment methods, wallets, and banks.
 */
router.get("/treasury/summary", async (_req, res): Promise<void> => {
  const cached = cache.get<unknown>("treasury:summary");
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  // Sales revenue by payment method (all time)
  const salesByMethod = await db
    .select({
      method: salesTable.paymentMethod,
      total: sql<string>`SUM(total)`,
    })
    .from(salesTable)
    .groupBy(salesTable.paymentMethod);

  // Digital wallets total balance
  const [walletTotals] = await db
    .select({ totalBalance: sql<string>`COALESCE(SUM(balance), 0)` })
    .from(walletsTable);

  const walletDetails = await db.select().from(walletsTable).orderBy(walletsTable.name);

  // Bank accounts total balance
  const [bankTotals] = await db
    .select({ totalBalance: sql<string>`COALESCE(SUM(balance), 0)` })
    .from(bankAccountsTable);

  const bankDetails = await db.select().from(bankAccountsTable).orderBy(bankAccountsTable.bankName);

  // Fawry remaining balance
  const fawryReceived = await db.select().from(fawryBalanceTable);
  const fawryTx = await db.select().from(fawryTransactionsTable);
  const fawryRemaining = fawryReceived.reduce((s, r) => s + Number(r.received), 0)
    - fawryTx.reduce((s, t) => s + Number(t.amount), 0);

  const result = {
    salesByPaymentMethod: salesByMethod.map(r => ({
      method: r.method,
      total: Number(r.total ?? 0),
    })),
    cashTotal: Number(salesByMethod.find(r => r.method === "cash")?.total ?? 0),
    walletsTotal: Number(walletTotals?.totalBalance ?? 0),
    banksTotal: Number(bankTotals?.totalBalance ?? 0),
    fawryBalance: fawryRemaining,
    wallets: walletDetails.map(w => ({ id: w.id, name: w.name, company: w.company, balance: Number(w.balance) })),
    banks: bankDetails.map(b => ({ id: b.id, bankName: b.bankName, accountNumber: b.accountNumber, balance: Number(b.balance) })),
    grandTotal:
      Number(walletTotals?.totalBalance ?? 0) +
      Number(bankTotals?.totalBalance ?? 0) +
      fawryRemaining,
  };

  cache.set("treasury:summary", result, TTL.DASHBOARD);
  res.setHeader("X-Cache", "MISS");
  res.json(result);
});

export default router;
