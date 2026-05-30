import { Router } from "express";
import { eq, gte, lte, and, sql } from "drizzle-orm";
import { db, auditLogTable } from "@workspace/db";

const router = Router();

router.get("/audit-log", async (req, res): Promise<void> => {
  const { entity, from, to, limit: rawLimit } = req.query as Record<string, string | undefined>;
  const limit = Math.min(Number(rawLimit ?? 100), 500);

  const conditions = [];
  if (entity) conditions.push(eq(auditLogTable.entity, entity));
  if (from) conditions.push(gte(auditLogTable.createdAt, new Date(from)));
  if (to) conditions.push(lte(auditLogTable.createdAt, new Date(to)));

  let query = db.select().from(auditLogTable).orderBy(sql`created_at DESC`).limit(limit).$dynamic();
  if (conditions.length > 0) query = query.where(and(...conditions));

  const rows = await query;
  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

export default router;
