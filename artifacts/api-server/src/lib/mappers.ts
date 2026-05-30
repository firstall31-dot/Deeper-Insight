/**
 * Centralized DB-row → API-response transformers.
 * Every route file imports from here — no local re-definitions allowed.
 *
 * Rules:
 *  - Drizzle `numeric` columns come back as strings → always cast with Number()
 *  - Date columns come back as Date objects    → always call .toISOString()
 *  - Nullable numeric columns (estimatedCost, salePrice) → ternary before Number()
 */

import type {
  salesTable,
  customersTable,
  suppliersTable,
  devicesTable,
  employeesTable,
  softwareServicesTable,
  maintenanceTable,
  installmentsTable,
  returnsTable,
  walletsTable,
  walletTransactionsTable,
  bankAccountsTable,
  bankTransactionsTable,
  fawryTransactionsTable,
  employeeAttendanceTable,
} from "@workspace/db";

// ─── Sales ───────────────────────────────────────────────────────────────────

export const mapSale = (s: typeof salesTable.$inferSelect) => ({
  ...s,
  subtotal: Number(s.subtotal),
  discount: Number(s.discount),
  total: Number(s.total),
  paidAmount: Number(s.paidAmount),
  dueAmount: Number(s.dueAmount),
  createdAt: s.createdAt.toISOString(),
  items: (s.items as unknown[]) ?? [],
});

// ─── Customers ───────────────────────────────────────────────────────────────

export const mapCustomer = (r: typeof customersTable.$inferSelect) => ({
  ...r,
  totalDebt: Number(r.totalDebt),
  createdAt: r.createdAt.toISOString(),
});

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const mapSupplier = (s: typeof suppliersTable.$inferSelect) => ({
  ...s,
  totalPurchases: Number(s.totalPurchases),
  totalDebt: Number(s.totalDebt),
  createdAt: s.createdAt.toISOString(),
});

// ─── Products ────────────────────────────────────────────────────────────────
// Products query joins suppliers, so the row shape differs from the raw table.

export type ProductRow = {
  id: number;
  name: string;
  nameAr: string | null;
  code: string;
  barcode: string | null;
  category: string;
  supplierId: number | null;
  supplierName: string | null;
  purchasePrice: string;
  salePrice: string;
  minSalePrice: string;
  quantity: number;
  alertQuantity: number;
  imageUrl: string | null;
  createdAt: Date;
};

export const mapProduct = (r: ProductRow) => ({
  ...r,
  purchasePrice: Number(r.purchasePrice),
  salePrice: Number(r.salePrice),
  minSalePrice: Number(r.minSalePrice),
  createdAt: r.createdAt.toISOString(),
});

// ─── Devices ─────────────────────────────────────────────────────────────────

export const mapDevice = (
  d: typeof devicesTable.$inferSelect,
  customerName?: string | null,
  supplierName?: string | null,
) => ({
  ...d,
  purchasePrice: Number(d.purchasePrice),
  salePrice: d.salePrice != null ? Number(d.salePrice) : null,
  customerName: customerName ?? null,
  customerPhone: null as string | null,
  supplierName: supplierName ?? null,
});

// ─── Employees ───────────────────────────────────────────────────────────────

export const mapEmployee = (e: typeof employeesTable.$inferSelect) => ({
  ...e,
  salary: Number(e.salary),
  advances: Number(e.advances),
  deductions: Number(e.deductions),
  createdAt: e.createdAt.toISOString(),
});

// ─── Software services ───────────────────────────────────────────────────────

export const mapSoftwareService = (s: typeof softwareServicesTable.$inferSelect) => ({
  ...s,
  cost: Number(s.cost),
  salePrice: Number(s.salePrice),
  createdAt: s.createdAt.toISOString(),
});

// ─── Maintenance ─────────────────────────────────────────────────────────────

export const mapMaintenance = (m: typeof maintenanceTable.$inferSelect) => ({
  ...m,
  estimatedCost: m.estimatedCost != null ? Number(m.estimatedCost) : null,
  finalCost: m.finalCost != null ? Number(m.finalCost) : null,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

// ─── Installments ────────────────────────────────────────────────────────────

export const mapInstallment = (i: typeof installmentsTable.$inferSelect) => ({
  ...i,
  totalAmount: Number(i.totalAmount),
  downPayment: Number(i.downPayment),
  installmentAmount: Number(i.installmentAmount),
  remainingAmount: Number(i.remainingAmount),
  createdAt: i.createdAt.toISOString(),
});

// ─── Returns ─────────────────────────────────────────────────────────────────

export const mapReturn = (r: typeof returnsTable.$inferSelect) => ({
  ...r,
  amount: Number(r.amount),
  createdAt: r.createdAt.toISOString(),
});

// ─── Wallets ─────────────────────────────────────────────────────────────────

export const mapWallet = (w: typeof walletsTable.$inferSelect) => ({
  ...w,
  balance: Number(w.balance),
});

export const mapWalletTx = (t: typeof walletTransactionsTable.$inferSelect) => ({
  ...t,
  amount: Number(t.amount),
  fee: Number(t.fee),
  balanceBefore: Number(t.balanceBefore),
  balanceAfter: Number(t.balanceAfter),
  createdAt: t.createdAt.toISOString(),
});

// ─── Bank accounts ───────────────────────────────────────────────────────────

export const mapBankAccount = (a: typeof bankAccountsTable.$inferSelect) => ({
  ...a,
  balance: Number(a.balance),
});

export const mapBankTx = (t: typeof bankTransactionsTable.$inferSelect) => ({
  ...t,
  amount: Number(t.amount),
  fee: Number(t.fee),
  balanceBefore: Number(t.balanceBefore),
  balanceAfter: Number(t.balanceAfter),
  createdAt: t.createdAt.toISOString(),
});

// ─── Fawry ───────────────────────────────────────────────────────────────────

export const mapFawryTx = (t: typeof fawryTransactionsTable.$inferSelect) => ({
  ...t,
  amount: Number(t.amount),
  profit: Number(t.profit),
  createdAt: t.createdAt.toISOString(),
});

// ─── Attendance ──────────────────────────────────────────────────────────────

export const mapAttendance = (r: typeof employeeAttendanceTable.$inferSelect) => ({
  ...r,
  createdAt: r.createdAt.toISOString(),
});
