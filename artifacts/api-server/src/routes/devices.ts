import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, devicesTable, customersTable, suppliersTable } from "@workspace/db";
import {
  ListDevicesQueryParams,
  ListDevicesResponse,
  CreateDeviceBody,
  GetDeviceParams,
  GetDeviceResponse,
  UpdateDeviceParams,
  UpdateDeviceBody,
  UpdateDeviceResponse,
} from "@workspace/api-zod";

const router = Router();

const mapDevice = (d: typeof devicesTable.$inferSelect, customerName?: string | null, supplierName?: string | null) => ({
  ...d,
  purchasePrice: Number(d.purchasePrice),
  salePrice: d.salePrice != null ? Number(d.salePrice) : null,
  customerName: customerName ?? null,
  customerPhone: null as string | null,
  supplierName: supplierName ?? null,
});

router.get("/devices", async (req, res): Promise<void> => {
  const query = ListDevicesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select({
      id: devicesTable.id,
      brand: devicesTable.brand,
      model: devicesTable.model,
      color: devicesTable.color,
      storage: devicesTable.storage,
      imei1: devicesTable.imei1,
      imei2: devicesTable.imei2,
      serialNumber: devicesTable.serialNumber,
      condition: devicesTable.condition,
      purchaseDate: devicesTable.purchaseDate,
      purchasePrice: devicesTable.purchasePrice,
      salePrice: devicesTable.salePrice,
      supplierId: devicesTable.supplierId,
      supplierName: suppliersTable.name,
      sold: devicesTable.sold,
      soldAt: devicesTable.soldAt,
      customerId: devicesTable.customerId,
      customerName: customersTable.name,
      customerPhone: customersTable.phone,
    })
    .from(devicesTable)
    .leftJoin(suppliersTable, eq(devicesTable.supplierId, suppliersTable.id))
    .leftJoin(customersTable, eq(devicesTable.customerId, customersTable.id))
    .$dynamic();

  const conditions = [];
  if (query.data.search) {
    conditions.push(
      or(
        ilike(devicesTable.brand, `%${query.data.search}%`),
        ilike(devicesTable.model, `%${query.data.search}%`),
        ilike(devicesTable.imei1, `%${query.data.search}%`),
        ilike(devicesTable.serialNumber, `%${query.data.search}%`),
      )
    );
  }

  const devices = rows.map(r => ({
    ...r,
    purchasePrice: Number(r.purchasePrice),
    salePrice: r.salePrice != null ? Number(r.salePrice) : null,
  }));

  res.json(ListDevicesResponse.parse(devices));
});

router.post("/devices", async (req, res): Promise<void> => {
  const parsed = CreateDeviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [device] = await db.insert(devicesTable).values({
    ...parsed.data,
    purchasePrice: String(parsed.data.purchasePrice),
    salePrice: parsed.data.salePrice != null ? String(parsed.data.salePrice) : null,
  }).returning();

  res.status(201).json(GetDeviceResponse.parse(mapDevice(device)));
});

router.get("/devices/:id", async (req, res): Promise<void> => {
  const params = GetDeviceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, params.data.id));
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  let customerName: string | null = null;
  if (device.customerId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.id, device.customerId));
    customerName = c?.name ?? null;
  }

  res.json(GetDeviceResponse.parse(mapDevice(device, customerName)));
});

router.patch("/devices/:id", async (req, res): Promise<void> => {
  const params = UpdateDeviceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDeviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.color !== undefined) updateData.color = parsed.data.color;
  if (parsed.data.storage !== undefined) updateData.storage = parsed.data.storage;
  if (parsed.data.salePrice !== undefined) updateData.salePrice = String(parsed.data.salePrice);
  if (parsed.data.sold !== undefined) updateData.sold = parsed.data.sold;
  if (parsed.data.soldAt !== undefined) updateData.soldAt = parsed.data.soldAt;
  if (parsed.data.customerId !== undefined) updateData.customerId = parsed.data.customerId;

  const [device] = await db.update(devicesTable).set(updateData).where(eq(devicesTable.id, params.data.id)).returning();
  if (!device) {
    res.status(404).json({ error: "Device not found" });
    return;
  }

  res.json(UpdateDeviceResponse.parse(mapDevice(device)));
});

export default router;
