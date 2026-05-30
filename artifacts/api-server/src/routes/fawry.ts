import { Router } from "express";
import { db, fawryBalanceTable, fawryTransactionsTable } from "@workspace/db";
import { cache } from "../lib/cache";
import {
  GetFawryBalanceResponse,
  AddFawryBalanceBody,
  ListFawryTransactionsResponse,
  CreateFawryTransactionBody,
} from "@workspace/api-zod";

const router = Router();

async function computeBalance() {
  const allReceived = await db.select().from(fawryBalanceTable);
  const allTx = await db.select().from(fawryTransactionsTable);
  const totalReceived = allReceived.reduce((sum, r) => sum + Number(r.received), 0);
  const totalUsed = allTx.reduce((sum, t) => sum + Number(t.amount), 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayProfit = allTx
    .filter(t => new Date(t.createdAt) >= today)
    .reduce((sum, t) => sum + Number(t.profit), 0);

  return { received: totalReceived, used: totalUsed, remaining: totalReceived - totalUsed, todayProfit };
}

router.get("/fawry/balance", async (_req, res): Promise<void> => {
  const balance = await computeBalance();
  res.json(GetFawryBalanceResponse.parse(balance));
});

router.post("/fawry/balance", async (req, res): Promise<void> => {
  const parsed = AddFawryBalanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(fawryBalanceTable).values({
    received: String(parsed.data.amount),
    used: "0",
    notes: parsed.data.notes ?? null,
  });

  cache.del("treasury:summary");
  cache.invalidatePrefix("dashboard:");
  const balance = await computeBalance();
  res.status(201).json(GetFawryBalanceResponse.parse(balance));
});

router.get("/fawry/transactions", async (_req, res): Promise<void> => {
  const rows = await db.select().from(fawryTransactionsTable).orderBy(fawryTransactionsTable.createdAt);
  res.json(ListFawryTransactionsResponse.parse(rows.map(r => ({
    ...r,
    amount: Number(r.amount),
    profit: Number(r.profit),
    createdAt: r.createdAt.toISOString(),
  }))));
});

router.post("/fawry/transactions", async (req, res): Promise<void> => {
  const parsed = CreateFawryTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [tx] = await db.insert(fawryTransactionsTable).values({
    serviceType: parsed.data.serviceType,
    amount: String(parsed.data.amount),
    profit: String(parsed.data.profit),
    customerPhone: parsed.data.customerPhone ?? null,
    notes: parsed.data.notes ?? null,
  }).returning();

  cache.del("treasury:summary");
  cache.invalidatePrefix("dashboard:");

  res.status(201).json({
    ...tx,
    amount: Number(tx.amount),
    profit: Number(tx.profit),
    createdAt: tx.createdAt.toISOString(),
  });
});

export default router;
