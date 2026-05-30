import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, maintenanceTable } from "@workspace/db";
import {
  ListMaintenanceQueryParams,
  ListMaintenanceResponse,
  CreateMaintenanceBody,
  GetMaintenanceParams,
  GetMaintenanceResponse,
  UpdateMaintenanceParams,
  UpdateMaintenanceBody,
  UpdateMaintenanceResponse,
} from "@workspace/api-zod";

const router = Router();

let ticketCounter = 1000;

function generateTicketNumber(): string {
  ticketCounter++;
  return `MNT-${ticketCounter}`;
}

const mapMaintenance = (m: typeof maintenanceTable.$inferSelect) => ({
  ...m,
  estimatedCost: m.estimatedCost != null ? Number(m.estimatedCost) : null,
  finalCost: m.finalCost != null ? Number(m.finalCost) : null,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

router.get("/maintenance", async (req, res): Promise<void> => {
  const query = ListMaintenanceQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(maintenanceTable).$dynamic();
  const conditions = [];

  if (query.data.status) {
    conditions.push(eq(maintenanceTable.status, query.data.status));
  }
  if (query.data.search) {
    conditions.push(
      or(
        ilike(maintenanceTable.customerName, `%${query.data.search}%`),
        ilike(maintenanceTable.ticketNumber, `%${query.data.search}%`),
        ilike(maintenanceTable.deviceBrand, `%${query.data.search}%`),
      )
    );
  }

  if (conditions.length === 1) {
    dbQuery = dbQuery.where(conditions[0]);
  }

  const rows = await dbQuery.orderBy(maintenanceTable.createdAt);
  res.json(ListMaintenanceResponse.parse(rows.map(mapMaintenance)));
});

router.post("/maintenance", async (req, res): Promise<void> => {
  const parsed = CreateMaintenanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db.insert(maintenanceTable).values({
    ...parsed.data,
    ticketNumber: generateTicketNumber(),
    estimatedCost: parsed.data.estimatedCost != null ? String(parsed.data.estimatedCost) : null,
  }).returning();

  res.status(201).json(GetMaintenanceResponse.parse(mapMaintenance(order)));
});

router.get("/maintenance/:id", async (req, res): Promise<void> => {
  const params = GetMaintenanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(maintenanceTable).where(eq(maintenanceTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Maintenance order not found" });
    return;
  }

  res.json(GetMaintenanceResponse.parse(mapMaintenance(order)));
});

router.patch("/maintenance/:id", async (req, res): Promise<void> => {
  const params = UpdateMaintenanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMaintenanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.estimatedCost !== undefined) updateData.estimatedCost = String(parsed.data.estimatedCost);
  if (parsed.data.finalCost !== undefined) updateData.finalCost = String(parsed.data.finalCost);
  if (parsed.data.technicianId !== undefined) updateData.technicianId = parsed.data.technicianId;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [order] = await db.update(maintenanceTable).set(updateData).where(eq(maintenanceTable.id, params.data.id)).returning();
  if (!order) {
    res.status(404).json({ error: "Maintenance order not found" });
    return;
  }

  res.json(UpdateMaintenanceResponse.parse(mapMaintenance(order)));
});

export default router;
