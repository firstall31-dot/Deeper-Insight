import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const installmentsTable = pgTable("installments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deviceName: text("device_name").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  downPayment: numeric("down_payment", { precision: 10, scale: 2 }).notNull().default("0"),
  installmentAmount: numeric("installment_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalInstallments: integer("total_installments").notNull().default(1),
  paidInstallments: integer("paid_installments").notNull().default(0),
  remainingAmount: numeric("remaining_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  nextDueDate: text("next_due_date"),
  startDate: text("start_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInstallmentSchema = createInsertSchema(installmentsTable).omit({ id: true, createdAt: true, paidInstallments: true, status: true });
export type InsertInstallment = z.infer<typeof insertInstallmentSchema>;
export type Installment = typeof installmentsTable.$inferSelect;
