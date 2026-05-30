import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, suppliersTable } from "@workspace/db";
import {
  ListSuppliersQueryParams,
  ListSuppliersResponse,
  CreateSupplierBody,
  GetSupplierParams,
  GetSupplierResponse,
  UpdateSupplierParams,
  UpdateSupplierBody,
  UpdateSupplierResponse,
  DeleteSupplierParams,
} from "@workspace/api-zod";

const router = Router();

const mapSupplier = (s: typeof suppliersTable.$inferSelect) => ({
  ...s,
  totalPurchases: Number(s.totalPurchases),
  totalDebt: Number(s.totalDebt),
  createdAt: s.createdAt.toISOString(),
});

router.get("/suppliers", async (req, res): Promise<void> => {
  const query = ListSuppliersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(suppliersTable).$dynamic();
  if (query.data.search) {
    dbQuery = dbQuery.where(
      or(
        ilike(suppliersTable.name, `%${query.data.search}%`),
        ilike(suppliersTable.phone, `%${query.data.search}%`),
      )
    );
  }

  const rows = await dbQuery.orderBy(suppliersTable.name);
  res.json(ListSuppliersResponse.parse(rows.map(mapSupplier)));
});

router.post("/suppliers", async (req, res): Promise<void> => {
  const parsed = CreateSupplierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [supplier] = await db.insert(suppliersTable).values(parsed.data).returning();
  res.status(201).json(mapSupplier(supplier));
});

router.get("/suppliers/:id", async (req, res): Promise<void> => {
  const params = GetSupplierParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [supplier] = await db.select().from(suppliersTable).where(eq(suppliersTable.id, params.data.id));
  if (!supplier) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }

  res.json(GetSupplierResponse.parse(mapSupplier(supplier)));
});

router.patch("/suppliers/:id", async (req, res): Promise<void> => {
  const params = UpdateSupplierParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSupplierBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [supplier] = await db.update(suppliersTable).set(parsed.data).where(eq(suppliersTable.id, params.data.id)).returning();
  if (!supplier) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }

  res.json(UpdateSupplierResponse.parse(mapSupplier(supplier)));
});

router.delete("/suppliers/:id", async (req, res): Promise<void> => {
  const params = DeleteSupplierParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(suppliersTable).where(eq(suppliersTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Supplier not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
