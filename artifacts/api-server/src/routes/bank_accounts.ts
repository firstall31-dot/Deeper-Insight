import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, bankAccountsTable, bankTransactionsTable } from "@workspace/db";
import {
  ListBankAccountsResponse,
  CreateBankAccountBody,
  ListBankTransactionsParams,
  ListBankTransactionsResponse,
  CreateBankTransactionParams,
  CreateBankTransactionBody,
} from "@workspace/api-zod";

const router = Router();

const mapAccount = (a: typeof bankAccountsTable.$inferSelect) => ({
  ...a,
  balance: Number(a.balance),
});

const mapTx = (t: typeof bankTransactionsTable.$inferSelect) => ({
  ...t,
  amount: Number(t.amount),
  fee: Number(t.fee),
  balanceBefore: Number(t.balanceBefore),
  balanceAfter: Number(t.balanceAfter),
  createdAt: t.createdAt.toISOString(),
});

router.get("/bank-accounts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(bankAccountsTable).orderBy(bankAccountsTable.bankName);
  res.json(ListBankAccountsResponse.parse(rows.map(mapAccount)));
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

  res.status(201).json(mapAccount(account));
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

  res.json(ListBankTransactionsResponse.parse(rows.map(mapTx)));
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
  let balanceAfter = balanceBefore;

  if (parsed.data.type === "deposit") {
    balanceAfter = balanceBefore + amount - fee;
  } else {
    balanceAfter = balanceBefore - amount - fee;
  }

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

  res.status(201).json(mapTx(tx));
});

export default router;
