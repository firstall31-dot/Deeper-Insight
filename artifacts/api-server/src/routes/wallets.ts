import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, walletsTable, walletTransactionsTable } from "@workspace/db";
import {
  ListWalletsResponse,
  CreateWalletBody,
  ListWalletTransactionsParams,
  ListWalletTransactionsResponse,
  CreateWalletTransactionParams,
  CreateWalletTransactionBody,
} from "@workspace/api-zod";

const router = Router();

const mapWallet = (w: typeof walletsTable.$inferSelect) => ({
  ...w,
  balance: Number(w.balance),
});

const mapTx = (t: typeof walletTransactionsTable.$inferSelect) => ({
  ...t,
  amount: Number(t.amount),
  fee: Number(t.fee),
  balanceBefore: Number(t.balanceBefore),
  balanceAfter: Number(t.balanceAfter),
  createdAt: t.createdAt.toISOString(),
});

router.get("/wallets", async (_req, res): Promise<void> => {
  const rows = await db.select().from(walletsTable).orderBy(walletsTable.name);
  res.json(ListWalletsResponse.parse(rows.map(mapWallet)));
});

router.post("/wallets", async (req, res): Promise<void> => {
  const parsed = CreateWalletBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [wallet] = await db.insert(walletsTable).values({
    ...parsed.data,
    balance: String(parsed.data.balance ?? 0),
  }).returning();

  res.status(201).json(mapWallet(wallet));
});

router.get("/wallets/:id/transactions", async (req, res): Promise<void> => {
  const params = ListWalletTransactionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(walletTransactionsTable)
    .where(eq(walletTransactionsTable.walletId, params.data.id))
    .orderBy(walletTransactionsTable.createdAt);

  res.json(ListWalletTransactionsResponse.parse(rows.map(mapTx)));
});

router.post("/wallets/:id/transactions", async (req, res): Promise<void> => {
  const params = CreateWalletTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateWalletTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.id, params.data.id));
  if (!wallet) {
    res.status(404).json({ error: "Wallet not found" });
    return;
  }

  const balanceBefore = Number(wallet.balance);
  const amount = parsed.data.amount;
  const fee = parsed.data.fee ?? 0;
  let balanceAfter = balanceBefore;

  if (parsed.data.type === "deposit" || parsed.data.type === "receive") {
    balanceAfter = balanceBefore + amount - fee;
  } else if (parsed.data.type === "withdraw" || parsed.data.type === "transfer") {
    balanceAfter = balanceBefore - amount - fee;
  }

  await db.update(walletsTable).set({ balance: String(balanceAfter) }).where(eq(walletsTable.id, params.data.id));

  const [tx] = await db.insert(walletTransactionsTable).values({
    walletId: params.data.id,
    type: parsed.data.type,
    amount: String(amount),
    fee: String(fee),
    balanceBefore: String(balanceBefore),
    balanceAfter: String(balanceAfter),
    notes: parsed.data.notes ?? null,
  }).returning();

  res.status(201).json(mapTx(tx));
});

export default router;
