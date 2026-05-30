import { Router } from "express";
import { gte, lte, and, sql, eq } from "drizzle-orm";
import { db, salesTable, expensesTable, productsTable } from "@workspace/db";
import {
  GetSalesReportQueryParams,
  GetSalesReportResponse,
  GetProfitReportQueryParams,
  GetProfitReportResponse,
  GetInventoryReportResponse,
} from "@workspace/api-zod";
import { cache, TTL } from "../lib/cache";

const router = Router();

router.get("/reports/sales", async (req, res): Promise<void> => {
  const query = GetSalesReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const cacheKey = `reports:sales:${query.data.from ?? ""}:${query.data.to ?? ""}:${query.data.groupBy ?? "day"}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const conditions = [];
  if (query.data.from) conditions.push(gte(salesTable.createdAt, new Date(query.data.from)));
  if (query.data.to) conditions.push(lte(salesTable.createdAt, new Date(query.data.to)));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Totals via SQL aggregation
  const [totals] = await db
    .select({
      totalSales: sql<string>`COUNT(*)`,
      totalRevenue: sql<string>`COALESCE(SUM(total), 0)`,
      totalDiscount: sql<string>`COALESCE(SUM(discount), 0)`,
    })
    .from(salesTable)
    .where(where);

  // Chart data — group by day or month using SQL date_trunc
  const groupBy = query.data.groupBy ?? "day";
  const truncExpr = groupBy === "month"
    ? sql<string>`TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM')`
    : sql<string>`TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD')`;

  const chartRows = await db
    .select({
      period: truncExpr,
      revenue: sql<string>`SUM(total)`,
      count: sql<string>`COUNT(*)`,
    })
    .from(salesTable)
    .where(where)
    .groupBy(truncExpr)
    .orderBy(truncExpr);

  const result = GetSalesReportResponse.parse({
    totalSales: Number(totals?.totalSales ?? 0),
    totalRevenue: Number(totals?.totalRevenue ?? 0),
    totalDiscount: Number(totals?.totalDiscount ?? 0),
    chartData: chartRows.map(r => ({
      period: r.period,
      revenue: Number(r.revenue ?? 0),
      count: Number(r.count ?? 0),
    })),
  });

  cache.set(cacheKey, result, TTL.REPORTS);
  res.setHeader("X-Cache", "MISS");
  res.json(result);
});

router.get("/reports/profit", async (req, res): Promise<void> => {
  const query = GetProfitReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const cacheKey = `reports:profit:${query.data.from ?? ""}:${query.data.to ?? ""}`;
  const cached = cache.get<unknown>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const [salesTotals] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(total), 0)`,
      totalCost: sql<string>`COALESCE(SUM(total * 0.7), 0)`,
    })
    .from(salesTable);

  const [expenseTotals] = await db
    .select({ totalExpenses: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(expensesTable);

  const totalRevenue = Number(salesTotals?.totalRevenue ?? 0);
  const totalCost = Number(salesTotals?.totalCost ?? 0);
  const totalExpenses = Number(expenseTotals?.totalExpenses ?? 0);
  const netProfit = totalRevenue - totalCost - totalExpenses;

  // Daily revenue + profit chart
  const salesChart = await db
    .select({
      period: sql<string>`TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD')`,
      revenue: sql<string>`SUM(total)`,
      profit: sql<string>`SUM(total * 0.3)`,
    })
    .from(salesTable)
    .groupBy(sql`DATE_TRUNC('day', created_at)`)
    .orderBy(sql`DATE_TRUNC('day', created_at)`);

  const expenseChart = await db
    .select({
      period: expensesTable.date,
      expenses: sql<string>`SUM(amount)`,
    })
    .from(expensesTable)
    .groupBy(expensesTable.date)
    .orderBy(expensesTable.date);

  // Merge into a single chart keyed by date
  const merged: Record<string, { period: string; revenue: number; profit: number; expenses: number }> = {};
  for (const r of salesChart) {
    merged[r.period] = { period: r.period, revenue: Number(r.revenue ?? 0), profit: Number(r.profit ?? 0), expenses: 0 };
  }
  for (const e of expenseChart) {
    if (!merged[e.period]) merged[e.period] = { period: e.period, revenue: 0, profit: 0, expenses: 0 };
    merged[e.period].expenses += Number(e.expenses ?? 0);
    merged[e.period].profit -= Number(e.expenses ?? 0);
  }

  const chartData = Object.values(merged).sort((a, b) => a.period.localeCompare(b.period));

  const result = GetProfitReportResponse.parse({ totalRevenue, totalCost, totalExpenses, netProfit, chartData });
  cache.set(cacheKey, result, TTL.REPORTS);
  res.setHeader("X-Cache", "MISS");
  res.json(result);
});

router.get("/reports/inventory", async (_req, res): Promise<void> => {
  const cacheKey = "reports:inventory";
  const cached = cache.get<unknown>(cacheKey);
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const [totals] = await db
    .select({
      totalProducts: sql<string>`COUNT(*)`,
      totalValue: sql<string>`COALESCE(SUM(purchase_price * quantity), 0)`,
      lowStockItems: sql<string>`SUM(CASE WHEN quantity <= alert_quantity THEN 1 ELSE 0 END)`,
    })
    .from(productsTable);

  const categories = await db
    .select({
      category: productsTable.category,
      count: sql<string>`SUM(quantity)`,
      value: sql<string>`SUM(purchase_price * quantity)`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(productsTable.category);

  const result = GetInventoryReportResponse.parse({
    totalProducts: Number(totals?.totalProducts ?? 0),
    totalValue: Number(totals?.totalValue ?? 0),
    lowStockItems: Number(totals?.lowStockItems ?? 0),
    categories: categories.map(c => ({
      category: c.category,
      count: Number(c.count ?? 0),
      value: Number(c.value ?? 0),
    })),
  });

  cache.set(cacheKey, result, TTL.REPORTS);
  res.setHeader("X-Cache", "MISS");
  res.json(result);
});

export default router;
