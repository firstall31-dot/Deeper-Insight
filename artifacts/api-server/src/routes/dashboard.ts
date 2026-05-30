import { Router } from "express";
import { gte, sql } from "drizzle-orm";
import { db, salesTable, expensesTable, installmentsTable, maintenanceTable, productsTable } from "@workspace/db";
import { GetDashboardSummaryResponse, GetDashboardAlertsResponse } from "@workspace/api-zod";

const router = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allSales = await db.select().from(salesTable);
  const todaySales = allSales.filter(s => s.createdAt >= todayStart);
  const monthSales = allSales.filter(s => s.createdAt >= monthStart);

  const dailySales = todaySales.reduce((sum, s) => sum + Number(s.total), 0);
  const monthlySales = monthSales.reduce((sum, s) => sum + Number(s.total), 0);

  const allExpenses = await db.select().from(expensesTable);
  const totalExpenses = allExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const allInstallments = await db.select().from(installmentsTable);
  const totalDebt = allInstallments
    .filter(i => i.status === "active" || i.status === "overdue")
    .reduce((sum, i) => sum + Number(i.remainingAmount), 0);

  const overdueInstallments = allInstallments.filter(i => i.status === "overdue").length;

  const maintenanceOrders = await db.select().from(maintenanceTable);
  const maintenanceCount = maintenanceOrders.filter(m => m.status !== "delivered").length;

  const products = await db.select().from(productsTable);
  const lowStockCount = products.filter(p => p.quantity <= p.alertQuantity).length;

  const totalRevenue = monthlySales;
  const totalCost = monthSales.reduce((sum, s) => sum + (Number(s.total) * 0.7), 0);
  const totalProfit = totalRevenue - totalCost;

  const paymentMethods = ["cash", "vodafone_cash", "etisalat_cash", "we_pay", "instapay", "bank_transfer"];
  const salesByPaymentMethod = paymentMethods.map(method => ({
    method,
    total: allSales.filter(s => s.paymentMethod === method).reduce((sum, s) => sum + Number(s.total), 0),
  }));

  const recentSales = allSales
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(s => ({
      ...s,
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      total: Number(s.total),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      createdAt: s.createdAt.toISOString(),
      items: [],
    }));

  res.json(GetDashboardSummaryResponse.parse({
    dailySales,
    monthlySales,
    totalProfit,
    totalExpenses,
    totalDebt,
    maintenanceCount,
    overdueInstallments,
    lowStockCount,
    salesByPaymentMethod,
    recentSales,
  }));
});

router.get("/dashboard/alerts", async (_req, res): Promise<void> => {
  const alerts: Array<{ id: string; type: string; message: string; severity: string; data?: object }> = [];

  const products = await db.select().from(productsTable);
  const lowStock = products.filter(p => p.quantity <= p.alertQuantity);
  for (const p of lowStock) {
    alerts.push({
      id: `low_stock_${p.id}`,
      type: "low_stock",
      message: `Low stock: ${p.name} (${p.quantity} remaining)`,
      severity: p.quantity === 0 ? "danger" : "warning",
      data: { productId: p.id, quantity: p.quantity },
    });
  }

  const installments = await db.select().from(installmentsTable);
  const overdue = installments.filter(i => i.status === "overdue");
  for (const inst of overdue) {
    alerts.push({
      id: `overdue_install_${inst.id}`,
      type: "overdue_installment",
      message: `Overdue installment: ${inst.customerName} - ${inst.deviceName}`,
      severity: "danger",
      data: { installmentId: inst.id },
    });
  }

  const maintenance = await db.select().from(maintenanceTable);
  const pending = maintenance.filter(m => m.status === "repaired");
  for (const m of pending) {
    alerts.push({
      id: `maintenance_${m.id}`,
      type: "maintenance_pending",
      message: `Ready for pickup: ${m.customerName} - ${m.deviceType}`,
      severity: "info",
      data: { maintenanceId: m.id },
    });
  }

  res.json(GetDashboardAlertsResponse.parse(alerts));
});

export default router;
