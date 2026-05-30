import { Router } from "express";
import { eq, ilike, gte, lte, and } from "drizzle-orm";
import { db, salesTable, customersTable, productsTable } from "@workspace/db";
import {
  ListSalesQueryParams,
  ListSalesResponse,
  CreateSaleBody,
  GetSaleParams,
  GetSaleResponse,
  DeleteSaleParams,
} from "@workspace/api-zod";

const router = Router();

const mapSale = (s: typeof salesTable.$inferSelect) => ({
  ...s,
  subtotal: Number(s.subtotal),
  discount: Number(s.discount),
  total: Number(s.total),
  paidAmount: Number(s.paidAmount),
  dueAmount: Number(s.dueAmount),
  createdAt: s.createdAt.toISOString(),
  items: (s.items as unknown[]) ?? [],
});

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `INV-${dateStr}-${rand}`;
}

router.get("/sales", async (req, res): Promise<void> => {
  const query = ListSalesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(salesTable).$dynamic();
  const conditions = [];

  if (query.data.search) {
    conditions.push(
      ilike(salesTable.customerName, `%${query.data.search}%`)
    );
  }
  if (query.data.from) {
    conditions.push(gte(salesTable.createdAt, new Date(query.data.from)));
  }
  if (query.data.to) {
    conditions.push(lte(salesTable.createdAt, new Date(query.data.to)));
  }
  if (query.data.paymentMethod) {
    conditions.push(eq(salesTable.paymentMethod, query.data.paymentMethod));
  }

  if (conditions.length > 0) {
    dbQuery = dbQuery.where(and(...conditions));
  }

  const rows = await dbQuery.orderBy(salesTable.createdAt);
  res.json(ListSalesResponse.parse(rows.map(mapSale)));
});

router.post("/sales", async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const items = parsed.data.items ?? [];
  const subtotal = items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  const discount = parsed.data.discount ?? 0;
  const total = subtotal - discount;
  const paidAmount = parsed.data.paidAmount ?? 0;
  const dueAmount = Math.max(0, total - paidAmount);

  const invoiceNumber = generateInvoiceNumber();

  const [sale] = await db.insert(salesTable).values({
    invoiceNumber,
    customerId: parsed.data.customerId ?? null,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone ?? null,
    subtotal: String(subtotal),
    discount: String(discount),
    total: String(total),
    paymentMethod: parsed.data.paymentMethod,
    paidAmount: String(paidAmount),
    dueAmount: String(dueAmount),
    items: items as never,
    notes: parsed.data.notes ?? null,
  }).returning();

  if (parsed.data.customerId && dueAmount > 0) {
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, parsed.data.customerId));
    if (customer) {
      await db.update(customersTable)
        .set({ totalDebt: String(Number(customer.totalDebt) + dueAmount) })
        .where(eq(customersTable.id, parsed.data.customerId));
    }
  }

  for (const item of items) {
    if (item.productId) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (product) {
        const newQty = Math.max(0, product.quantity - item.quantity);
        await db.update(productsTable).set({ quantity: newQty }).where(eq(productsTable.id, item.productId));
      }
    }
  }

  res.status(201).json(GetSaleResponse.parse({ ...mapSale(sale), items: items as never }));
});

router.get("/sales/:id", async (req, res): Promise<void> => {
  const params = GetSaleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [sale] = await db.select().from(salesTable).where(eq(salesTable.id, params.data.id));
  if (!sale) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }

  res.json(GetSaleResponse.parse(mapSale(sale)));
});

router.delete("/sales/:id", async (req, res): Promise<void> => {
  const params = DeleteSaleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(salesTable).where(eq(salesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Sale not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
