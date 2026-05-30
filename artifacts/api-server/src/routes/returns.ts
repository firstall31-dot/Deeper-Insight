import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, returnsTable, salesTable } from "@workspace/db";
import {
  ListReturnsResponse,
  CreateReturnBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/returns", async (_req, res): Promise<void> => {
  const rows = await db.select().from(returnsTable).orderBy(returnsTable.createdAt);
  const returns = rows.map(r => ({
    ...r,
    amount: Number(r.amount),
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(ListReturnsResponse.parse(returns));
});

router.post("/returns", async (req, res): Promise<void> => {
  const parsed = CreateReturnBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, parsed.data.saleId));
  if (!sale) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }

  const [ret] = await db.insert(returnsTable).values({
    saleId: parsed.data.saleId,
    invoiceNumber: sale.invoiceNumber,
    customerName: sale.customerName,
    reason: parsed.data.reason,
    type: parsed.data.type,
    amount: String(parsed.data.amount),
    employeeId: parsed.data.employeeId ?? null,
  }).returning();

  res.status(201).json({
    ...ret,
    amount: Number(ret.amount),
    createdAt: ret.createdAt.toISOString(),
  });
});

export default router;
