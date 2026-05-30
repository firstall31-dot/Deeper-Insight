import { Router } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, expensesTable } from "@workspace/db";
import {
  ListExpensesQueryParams,
  ListExpensesResponse,
  CreateExpenseBody,
  DeleteExpenseParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/expenses", async (req, res): Promise<void> => {
  const query = ListExpensesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(expensesTable).$dynamic();
  const conditions = [];

  if (query.data.category) {
    conditions.push(eq(expensesTable.category, query.data.category));
  }
  if (query.data.from) {
    conditions.push(gte(expensesTable.date, query.data.from));
  }
  if (query.data.to) {
    conditions.push(lte(expensesTable.date, query.data.to));
  }

  if (conditions.length > 0) {
    dbQuery = dbQuery.where(and(...conditions));
  }

  const rows = await dbQuery.orderBy(expensesTable.date);
  const expenses = rows.map(r => ({
    ...r,
    amount: Number(r.amount),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListExpensesResponse.parse(expenses));
});

router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [expense] = await db.insert(expensesTable).values({
    ...parsed.data,
    amount: String(parsed.data.amount),
  }).returning();

  res.status(201).json({
    ...expense,
    amount: Number(expense.amount),
    createdAt: expense.createdAt.toISOString(),
  });
});

router.delete("/expenses/:id", async (req, res): Promise<void> => {
  const params = DeleteExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(expensesTable).where(eq(expensesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
