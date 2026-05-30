import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const returnsTable = pgTable("returns", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  customerName: text("customer_name").notNull(),
  reason: text("reason").notNull(),
  type: text("type").notNull().default("return"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  employeeId: integer("employee_id"),
  employeeName: text("employee_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReturnSchema = createInsertSchema(returnsTable).omit({ id: true, createdAt: true, invoiceNumber: true, customerName: true, employeeName: true });
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type Return = typeof returnsTable.$inferSelect;
