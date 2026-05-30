import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, softwareServicesTable } from "@workspace/db";
import { mapSoftwareService } from "../lib/mappers";
import {
  ListSoftwareServicesResponse,
  CreateSoftwareServiceBody,
  UpdateSoftwareServiceParams,
  UpdateSoftwareServiceBody,
  UpdateSoftwareServiceResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/software-services", async (_req, res): Promise<void> => {
  const rows = await db.select().from(softwareServicesTable).orderBy(softwareServicesTable.createdAt);
  res.json(ListSoftwareServicesResponse.parse(rows.map(mapSoftwareService)));
});

router.post("/software-services", async (req, res): Promise<void> => {
  const parsed = CreateSoftwareServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db.insert(softwareServicesTable).values({
    ...parsed.data,
    cost: String(parsed.data.cost),
    salePrice: String(parsed.data.salePrice),
  }).returning();

  res.status(201).json(mapSoftwareService(service));
});

router.patch("/software-services/:id", async (req, res): Promise<void> => {
  const params = UpdateSoftwareServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSoftwareServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.cost !== undefined) updateData.cost = String(parsed.data.cost);
  if (parsed.data.salePrice !== undefined) updateData.salePrice = String(parsed.data.salePrice);
  if (parsed.data.technicianId !== undefined) updateData.technicianId = parsed.data.technicianId;
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

  const [service] = await db.update(softwareServicesTable).set(updateData).where(eq(softwareServicesTable.id, params.data.id)).returning();
  if (!service) {
    res.status(404).json({ error: "Software service not found" });
    return;
  }

  res.json(UpdateSoftwareServiceResponse.parse(mapSoftwareService(service)));
});

export default router;
