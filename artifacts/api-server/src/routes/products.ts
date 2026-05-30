import { Router } from "express";
import { eq, ilike, or, lte } from "drizzle-orm";
import { db, productsTable, suppliersTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  ListProductsResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  DeleteProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      nameAr: productsTable.nameAr,
      code: productsTable.code,
      barcode: productsTable.barcode,
      category: productsTable.category,
      supplierId: productsTable.supplierId,
      supplierName: suppliersTable.name,
      purchasePrice: productsTable.purchasePrice,
      salePrice: productsTable.salePrice,
      minSalePrice: productsTable.minSalePrice,
      quantity: productsTable.quantity,
      alertQuantity: productsTable.alertQuantity,
      imageUrl: productsTable.imageUrl,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(suppliersTable, eq(productsTable.supplierId, suppliersTable.id))
    .$dynamic();

  const conditions = [];
  if (query.data.search) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${query.data.search}%`),
        ilike(productsTable.code, `%${query.data.search}%`),
      )
    );
  }
  if (query.data.category) {
    conditions.push(eq(productsTable.category, query.data.category));
  }
  if (query.data.lowStock === true || query.data.lowStock === "true" as never) {
    conditions.push(lte(productsTable.quantity, productsTable.alertQuantity));
  }

  if (conditions.length > 0) {
    dbQuery = dbQuery.where(conditions.length === 1 ? conditions[0] : conditions.reduce((a, b) => or(a, b) as never));
  }

  const rows = await dbQuery.orderBy(productsTable.createdAt);

  const products = rows.map(r => ({
    ...r,
    purchasePrice: Number(r.purchasePrice),
    salePrice: Number(r.salePrice),
    minSalePrice: Number(r.minSalePrice),
    createdAt: r.createdAt.toISOString(),
  }));

  res.json(ListProductsResponse.parse(products));
});

router.post("/products", async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    name: parsed.data.name,
    nameAr: parsed.data.nameAr,
    code: parsed.data.code,
    barcode: parsed.data.barcode,
    category: parsed.data.category,
    supplierId: parsed.data.supplierId,
    purchasePrice: String(parsed.data.purchasePrice ?? 0),
    salePrice: String(parsed.data.salePrice ?? 0),
    minSalePrice: String(parsed.data.minSalePrice ?? 0),
    quantity: parsed.data.quantity,
    alertQuantity: parsed.data.alertQuantity,
    imageUrl: parsed.data.imageUrl,
  }).returning();

  const supplier = product.supplierId
    ? await db.select().from(suppliersTable).where(eq(suppliersTable.id, product.supplierId)).limit(1).then(r => r[0])
    : null;

  res.status(201).json(GetProductResponse.parse({
    ...product,
    supplierName: supplier?.name ?? null,
    purchasePrice: Number(product.purchasePrice),
    salePrice: Number(product.salePrice),
    minSalePrice: Number(product.minSalePrice),
    createdAt: product.createdAt.toISOString(),
  }));
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      nameAr: productsTable.nameAr,
      code: productsTable.code,
      barcode: productsTable.barcode,
      category: productsTable.category,
      supplierId: productsTable.supplierId,
      supplierName: suppliersTable.name,
      purchasePrice: productsTable.purchasePrice,
      salePrice: productsTable.salePrice,
      minSalePrice: productsTable.minSalePrice,
      quantity: productsTable.quantity,
      alertQuantity: productsTable.alertQuantity,
      imageUrl: productsTable.imageUrl,
      createdAt: productsTable.createdAt,
    })
    .from(productsTable)
    .leftJoin(suppliersTable, eq(productsTable.supplierId, suppliersTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!rows[0]) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const r = rows[0];
  res.json(GetProductResponse.parse({
    ...r,
    purchasePrice: Number(r.purchasePrice),
    salePrice: Number(r.salePrice),
    minSalePrice: Number(r.minSalePrice),
    createdAt: r.createdAt.toISOString(),
  }));
});

router.patch("/products/:id", async (req, res): Promise<void> => {
  const params = UpdateProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.nameAr !== undefined) updateData.nameAr = parsed.data.nameAr;
  if (parsed.data.barcode !== undefined) updateData.barcode = parsed.data.barcode;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.supplierId !== undefined) updateData.supplierId = parsed.data.supplierId;
  if (parsed.data.purchasePrice !== undefined) updateData.purchasePrice = String(parsed.data.purchasePrice);
  if (parsed.data.salePrice !== undefined) updateData.salePrice = String(parsed.data.salePrice);
  if (parsed.data.minSalePrice !== undefined) updateData.minSalePrice = String(parsed.data.minSalePrice);
  if (parsed.data.quantity !== undefined) updateData.quantity = parsed.data.quantity;
  if (parsed.data.alertQuantity !== undefined) updateData.alertQuantity = parsed.data.alertQuantity;
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;

  const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, params.data.id)).returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(UpdateProductResponse.parse({
    ...product,
    supplierName: null,
    purchasePrice: Number(product.purchasePrice),
    salePrice: Number(product.salePrice),
    minSalePrice: Number(product.minSalePrice),
    createdAt: product.createdAt.toISOString(),
  }));
});

router.delete("/products/:id", async (req, res): Promise<void> => {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
