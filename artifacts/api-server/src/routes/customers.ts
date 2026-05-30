import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, customersTable, salesTable, installmentsTable, maintenanceTable } from "@workspace/db";
import {
  ListCustomersQueryParams,
  ListCustomersResponse,
  CreateCustomerBody,
  GetCustomerParams,
  GetCustomerResponse,
  UpdateCustomerParams,
  UpdateCustomerBody,
  UpdateCustomerResponse,
  DeleteCustomerParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/customers", async (req, res): Promise<void> => {
  const query = ListCustomersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(customersTable).$dynamic();
  if (query.data.search) {
    dbQuery = dbQuery.where(
      or(
        ilike(customersTable.name, `%${query.data.search}%`),
        ilike(customersTable.phone, `%${query.data.search}%`),
      )
    );
  }

  const rows = await dbQuery.orderBy(customersTable.createdAt);
  const customers = rows.map(r => ({
    ...r,
    totalDebt: Number(r.totalDebt),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListCustomersResponse.parse(customers));
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db.insert(customersTable).values(parsed.data).returning();
  res.status(201).json({
    ...customer,
    totalDebt: Number(customer.totalDebt),
    createdAt: customer.createdAt.toISOString(),
  });
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, params.data.id));
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  const salesRows = await db.select().from(salesTable).where(eq(salesTable.customerId, params.data.id));
  const installmentRows = await db.select().from(installmentsTable).where(eq(installmentsTable.customerId, params.data.id));
  const maintenanceRows = await db.select().from(maintenanceTable).where(eq(maintenanceTable.customerId, params.data.id));

  const mapSale = (s: typeof salesRows[0]) => ({
    ...s,
    subtotal: Number(s.subtotal),
    discount: Number(s.discount),
    total: Number(s.total),
    paidAmount: Number(s.paidAmount),
    dueAmount: Number(s.dueAmount),
    createdAt: s.createdAt.toISOString(),
  });

  const mapInstallment = (i: typeof installmentRows[0]) => ({
    ...i,
    totalAmount: Number(i.totalAmount),
    downPayment: Number(i.downPayment),
    installmentAmount: Number(i.installmentAmount),
    remainingAmount: Number(i.remainingAmount),
    createdAt: i.createdAt.toISOString(),
  });

  const mapMaintenance = (m: typeof maintenanceRows[0]) => ({
    ...m,
    estimatedCost: m.estimatedCost != null ? Number(m.estimatedCost) : null,
    finalCost: m.finalCost != null ? Number(m.finalCost) : null,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  });

  res.json(GetCustomerResponse.parse({
    ...customer,
    totalDebt: Number(customer.totalDebt),
    createdAt: customer.createdAt.toISOString(),
    sales: salesRows.map(mapSale),
    installments: installmentRows.map(mapInstallment),
    maintenanceOrders: maintenanceRows.map(mapMaintenance),
  }));
});

router.patch("/customers/:id", async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db.update(customersTable).set(parsed.data).where(eq(customersTable.id, params.data.id)).returning();
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(UpdateCustomerResponse.parse({
    ...customer,
    totalDebt: Number(customer.totalDebt),
    createdAt: customer.createdAt.toISOString(),
  }));
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(customersTable).where(eq(customersTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
