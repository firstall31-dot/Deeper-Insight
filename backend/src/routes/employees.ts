import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, employeesTable } from "@workspace/db";
import { mapEmployee } from "../lib/mappers";
import {
  ListEmployeesResponse,
  CreateEmployeeBody,
  UpdateEmployeeParams,
  UpdateEmployeeBody,
  UpdateEmployeeResponse,
  DeleteEmployeeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/employees", async (_req, res): Promise<void> => {
  const rows = await db.select().from(employeesTable).orderBy(employeesTable.name);
  res.json(ListEmployeesResponse.parse(rows.map(mapEmployee)));
});

router.post("/employees", async (req, res): Promise<void> => {
  const parsed = CreateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [employee] = await db.insert(employeesTable).values({
    ...parsed.data,
    salary: String(parsed.data.salary),
  }).returning();

  res.status(201).json(mapEmployee(employee));
});

router.patch("/employees/:id", async (req, res): Promise<void> => {
  const params = UpdateEmployeeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;
  if (parsed.data.salary !== undefined) updateData.salary = String(parsed.data.salary);
  if (parsed.data.advances !== undefined) updateData.advances = String(parsed.data.advances);
  if (parsed.data.deductions !== undefined) updateData.deductions = String(parsed.data.deductions);

  const [employee] = await db.update(employeesTable).set(updateData).where(eq(employeesTable.id, params.data.id)).returning();
  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }

  res.json(UpdateEmployeeResponse.parse(mapEmployee(employee)));
});

router.delete("/employees/:id", async (req, res): Promise<void> => {
  const params = DeleteEmployeeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(employeesTable).where(eq(employeesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
