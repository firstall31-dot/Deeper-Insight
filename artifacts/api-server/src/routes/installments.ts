import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, installmentsTable, customersTable } from "@workspace/db";
import {
  ListInstallmentsQueryParams,
  ListInstallmentsResponse,
  CreateInstallmentBody,
  GetInstallmentParams,
  GetInstallmentResponse,
  UpdateInstallmentParams,
  UpdateInstallmentBody,
  UpdateInstallmentResponse,
} from "@workspace/api-zod";

const router = Router();

const mapInstallment = (i: typeof installmentsTable.$inferSelect) => ({
  ...i,
  totalAmount: Number(i.totalAmount),
  downPayment: Number(i.downPayment),
  installmentAmount: Number(i.installmentAmount),
  remainingAmount: Number(i.remainingAmount),
  createdAt: i.createdAt.toISOString(),
});

router.get("/installments", async (req, res): Promise<void> => {
  const query = ListInstallmentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(installmentsTable).$dynamic();
  if (query.data.status) {
    dbQuery = dbQuery.where(eq(installmentsTable.status, query.data.status));
  }

  const rows = await dbQuery.orderBy(installmentsTable.createdAt);
  res.json(ListInstallmentsResponse.parse(rows.map(mapInstallment)));
});

router.post("/installments", async (req, res): Promise<void> => {
  const parsed = CreateInstallmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, parsed.data.customerId));
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  const remainingAmount = parsed.data.totalAmount - parsed.data.downPayment;

  const [installment] = await db.insert(installmentsTable).values({
    customerId: parsed.data.customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    deviceName: parsed.data.deviceName,
    totalAmount: String(parsed.data.totalAmount),
    downPayment: String(parsed.data.downPayment),
    installmentAmount: String(parsed.data.installmentAmount),
    totalInstallments: parsed.data.totalInstallments,
    paidInstallments: 0,
    remainingAmount: String(remainingAmount),
    startDate: parsed.data.startDate,
    nextDueDate: parsed.data.startDate,
    status: "active",
  }).returning();

  res.status(201).json(mapInstallment(installment));
});

router.get("/installments/:id", async (req, res): Promise<void> => {
  const params = GetInstallmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [installment] = await db.select().from(installmentsTable).where(eq(installmentsTable.id, params.data.id));
  if (!installment) {
    res.status(404).json({ error: "Installment not found" });
    return;
  }

  res.json(GetInstallmentResponse.parse(mapInstallment(installment)));
});

router.patch("/installments/:id", async (req, res): Promise<void> => {
  const params = UpdateInstallmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInstallmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.paidInstallments !== undefined) updateData.paidInstallments = parsed.data.paidInstallments;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const [current] = await db.select().from(installmentsTable).where(eq(installmentsTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Installment not found" });
    return;
  }

  if (parsed.data.paidInstallments !== undefined) {
    const paid = parsed.data.paidInstallments;
    const remaining = Number(current.totalAmount) - Number(current.downPayment) - (paid * Number(current.installmentAmount));
    updateData.remainingAmount = String(Math.max(0, remaining));
    if (paid >= current.totalInstallments) {
      updateData.status = "completed";
    }
  }

  const [installment] = await db.update(installmentsTable).set(updateData).where(eq(installmentsTable.id, params.data.id)).returning();

  res.json(UpdateInstallmentResponse.parse(mapInstallment(installment)));
});

export default router;
