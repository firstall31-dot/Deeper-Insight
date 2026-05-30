import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, bankAccountsTable, bankTransactionsTable } from "@workspace/db";
import { mapBankAccount, mapBankTx } from "../lib/mappers";
import { cache } from "../lib/cache";
import {
  ListBankAccountsResponse,
  CreateBankAccountBody,
  ListBankTransactionsParams,
  ListBankTransactionsResponse,
  CreateBankTransactionParams,
  CreateBankTransactionBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/bank-accounts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(bankAccountsTable).orderBy(bankAccountsTable.bankName);
  res.json(ListBankAccountsResponse.parse(rows.map(mapBankAccount)));
});

router.post("/bank-accounts", async (req, res): Promise<void> => {
  const parsed = CreateBankAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [account] = await db.insert(bankAccountsTable).values({
    ...parsed.data,
    balance: String(parsed.data.balance ?? 0),
  }).returning();

  cache.del("treasury:summary");
  res.status(201).json(mapBankAccount(account));
});

router.get("/bank-accounts/:id/transactions", async (req, res): Promise<void> => {
  const params = ListBankTransactionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db.select().from(bankTransactionsTable)
    .where(eq(bankTransactionsTable.bankAccountId, params.data.id))
    .orderBy(bankTransactionsTable.createdAt);

  res.json(ListBankTransactionsResponse.parse(rows.map(mapBankTx)));
});

router.post("/bank-accounts/:id/transactions", async (req, res): Promise<void> => {
  const params = CreateBankTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateBankTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [account] = await db.select().from(bankAccountsTable).where(eq(bankAccountsTable.id, params.data.id));
  if (!account) {
    res.status(404).json({ error: "Bank account not found" });
    return;
  }

  const balanceBefore = Number(account.balance);
  const amount = parsed.data.amount;
  const fee = parsed.data.fee ?? 0;
  const balanceAfter = parsed.data.type === "deposit"
    ? balanceBefore + amount - fee
    : balanceBefore - amount - fee;

  await db.update(bankAccountsTable).set({ balance: String(balanceAfter) }).where(eq(bankAccountsTable.id, params.data.id));

  const [tx] = await db.insert(bankTransactionsTable).values({
    bankAccountId: params.data.id,
    type: parsed.data.type,
    amount: String(amount),
    fee: String(fee),
    balanceBefore: String(balanceBefore),
    balanceAfter: String(balanceAfter),
    notes: parsed.data.notes ?? null,
  }).returning();

  cache.del("treasury:summary");
  res.status(201).json(mapBankTx(tx));
});

export default router;
