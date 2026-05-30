import { Router } from "express";
import { gte, lte, and } from "drizzle-orm";
import { db, salesTable, expensesTable, productsTable } from "@workspace/db";
import {
  GetSalesReportQueryParams,
  GetSalesReportResponse,
  GetProfitReportQueryParams,
  GetProfitReportResponse,
  GetInventoryReportResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/reports/sales", async (req, res): Promise<void> => {
  const query = GetSalesReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(salesTable).$dynamic();
  const conditions = [];
  if (query.data.from) conditions.push(gte(salesTable.createdAt, new Date(query.data.from)));
  if (query.data.to) conditions.push(lte(salesTable.createdAt, new Date(query.data.to)));
  if (conditions.length > 0) dbQuery = dbQuery.where(and(...conditions));

  const sales = await dbQuery;
  const groupBy = query.data.groupBy ?? "day";

  const grouped: Record<string, { revenue: number; count: number }> = {};
  for (const s of sales) {
    const date = new Date(s.createdAt);
    const key = groupBy === "month"
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      : date.toISOString().slice(0, 10);

    if (!grouped[key]) grouped[key] = { revenue: 0, count: 0 };
    grouped[key].revenue += Number(s.total);
    grouped[key].count++;
  }

  const chartData = Object.entries(grouped)
    .map(([period, data]) => ({ period, ...data }))
    .sort((a, b) => a.period.localeCompare(b.period));

  res.json(GetSalesReportResponse.parse({
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum, s) => sum + Number(s.total), 0),
    totalDiscount: sales.reduce((sum, s) => sum + Number(s.discount), 0),
    chartData,
  }));
});

router.get("/reports/profit", async (req, res): Promise<void> => {
  const query = GetProfitReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const sales = await db.select().from(salesTable);
  const expenses = await db.select().from(expensesTable);

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalCost = totalRevenue * 0.7;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalCost - totalExpenses;

  const grouped: Record<string, { profit: number; revenue: number; expenses: number }> = {};
  for (const s of sales) {
    const key = new Date(s.createdAt).toISOString().slice(0, 10);
    if (!grouped[key]) grouped[key] = { profit: 0, revenue: 0, expenses: 0 };
    grouped[key].revenue += Number(s.total);
    grouped[key].profit += Number(s.total) * 0.3;
  }
  for (const e of expenses) {
    const key = e.date;
    if (!grouped[key]) grouped[key] = { profit: 0, revenue: 0, expenses: 0 };
    grouped[key].expenses += Number(e.amount);
    grouped[key].profit -= Number(e.amount);
  }

  const chartData = Object.entries(grouped)
    .map(([period, data]) => ({ period, ...data }))
    .sort((a, b) => a.period.localeCompare(b.period));

  res.json(GetProfitReportResponse.parse({
    totalRevenue,
    totalCost,
    totalExpenses,
    netProfit,
    chartData,
  }));
});

router.get("/reports/inventory", async (_req, res): Promise<void> => {
  const products = await db.select().from(productsTable);

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.purchasePrice) * p.quantity), 0);
  const lowStockItems = products.filter(p => p.quantity <= p.alertQuantity).length;

  const categoryMap: Record<string, { count: number; value: number }> = {};
  for (const p of products) {
    if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, value: 0 };
    categoryMap[p.category].count += p.quantity;
    categoryMap[p.category].value += Number(p.purchasePrice) * p.quantity;
  }

  const categories = Object.entries(categoryMap).map(([category, data]) => ({ category, ...data }));

  res.json(GetInventoryReportResponse.parse({ totalProducts, totalValue, lowStockItems, categories }));
});

export default router;
