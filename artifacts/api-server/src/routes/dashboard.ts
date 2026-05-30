import { Router } from "express";
import { gte, and, sql, eq, lte } from "drizzle-orm";
import { db, salesTable, expensesTable, installmentsTable, maintenanceTable, productsTable } from "@workspace/db";
import { GetDashboardSummaryResponse, GetDashboardAlertsResponse } from "@workspace/api-zod";
import { cache, TTL } from "../lib/cache";

const router = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const cached = cache.get<unknown>("dashboard:summary");
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Use SQL aggregations — no full table scans in JS
  const [dailyRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(total), 0)` })
    .from(salesTable)
    .where(gte(salesTable.createdAt, todayStart));

  const [monthlyRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(total), 0)`, cost: sql<string>`COALESCE(SUM(total * 0.7), 0)` })
    .from(salesTable)
    .where(gte(salesTable.createdAt, monthStart));

  const [expenseRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(expensesTable);

  const [debtRow] = await db
    .select({ total: sql<string>`COALESCE(SUM(remaining_amount), 0)` })
    .from(installmentsTable)
    .where(sql`status IN ('active', 'overdue')`);

  const [overdueRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(installmentsTable)
    .where(eq(installmentsTable.status, "overdue"));

  const [maintenanceRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(maintenanceTable)
    .where(sql`status != 'delivered'`);

  const [lowStockRow] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(productsTable)
    .where(sql`quantity <= alert_quantity`);

  // Payment method breakdown (one query)
  const paymentBreakdown = await db
    .select({
      method: salesTable.paymentMethod,
      total: sql<string>`SUM(total)`,
    })
    .from(salesTable)
    .groupBy(salesTable.paymentMethod);

  const paymentMethods = ["cash", "vodafone_cash", "etisalat_cash", "we_pay", "instapay", "bank_transfer"];
  const salesByPaymentMethod = paymentMethods.map(method => ({
    method,
    total: Number(paymentBreakdown.find(r => r.method === method)?.total ?? 0),
  }));

  // Recent 5 sales
  const recentSales = await db
    .select()
    .from(salesTable)
    .orderBy(sql`created_at DESC`)
    .limit(5);

  const monthlySales = Number(monthlyRow?.total ?? 0);
  const totalCost = Number(monthlyRow?.cost ?? 0);

  const result = {
    dailySales: Number(dailyRow?.total ?? 0),
    monthlySales,
    totalProfit: monthlySales - totalCost,
    totalExpenses: Number(expenseRow?.total ?? 0),
    totalDebt: Number(debtRow?.total ?? 0),
    maintenanceCount: Number(maintenanceRow?.count ?? 0),
    overdueInstallments: Number(overdueRow?.count ?? 0),
    lowStockCount: Number(lowStockRow?.count ?? 0),
    salesByPaymentMethod,
    recentSales: recentSales.map(s => ({
      ...s,
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      total: Number(s.total),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      createdAt: s.createdAt.toISOString(),
      items: [],
    })),
  };

  const parsed = GetDashboardSummaryResponse.parse(result);
  cache.set("dashboard:summary", parsed, TTL.DASHBOARD);

  res.setHeader("X-Cache", "MISS");
  res.json(parsed);
});

router.get("/dashboard/alerts", async (_req, res): Promise<void> => {
  const cached = cache.get<unknown>("dashboard:alerts");
  if (cached) {
    res.setHeader("X-Cache", "HIT");
    res.json(cached);
    return;
  }

  const alerts: Array<{ id: string; type: string; message: string; severity: string; data?: object }> = [];

  // Low stock — SQL WHERE, not full scan
  const lowStock = await db
    .select({ id: productsTable.id, name: productsTable.name, quantity: productsTable.quantity })
    .from(productsTable)
    .where(sql`quantity <= alert_quantity`);

  for (const p of lowStock) {
    alerts.push({
      id: `low_stock_${p.id}`,
      type: "low_stock",
      message: `Low stock: ${p.name} (${p.quantity} remaining)`,
      severity: p.quantity === 0 ? "danger" : "warning",
      data: { productId: p.id, quantity: p.quantity },
    });
  }

  // Overdue installments
  const overdue = await db
    .select({ id: installmentsTable.id, customerName: installmentsTable.customerName, deviceName: installmentsTable.deviceName })
    .from(installmentsTable)
    .where(eq(installmentsTable.status, "overdue"));

  for (const inst of overdue) {
    alerts.push({
      id: `overdue_install_${inst.id}`,
      type: "overdue_installment",
      message: `Overdue installment: ${inst.customerName} - ${inst.deviceName}`,
      severity: "danger",
      data: { installmentId: inst.id },
    });
  }

  // Maintenance ready for pickup
  const readyForPickup = await db
    .select({ id: maintenanceTable.id, customerName: maintenanceTable.customerName, deviceType: maintenanceTable.deviceType })
    .from(maintenanceTable)
    .where(eq(maintenanceTable.status, "repaired"));

  for (const m of readyForPickup) {
    alerts.push({
      id: `maintenance_${m.id}`,
      type: "maintenance_pending",
      message: `Ready for pickup: ${m.customerName} - ${m.deviceType}`,
      severity: "info",
      data: { maintenanceId: m.id },
    });
  }

  const parsed = GetDashboardAlertsResponse.parse(alerts);
  cache.set("dashboard:alerts", parsed, TTL.DASHBOARD);

  res.setHeader("X-Cache", "MISS");
  res.json(parsed);
});

export default router;
