import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fawryBalanceTable = pgTable("fawry_balance", {
  id: serial("id").primaryKey(),
  received: numeric("received", { precision: 10, scale: 2 }).notNull().default("0"),
  used: numeric("used", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const fawryTransactionsTable = pgTable("fawry_transactions", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  profit: numeric("profit", { precision: 10, scale: 2 }).notNull().default("0"),
  customerPhone: text("customer_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFawryBalanceSchema = createInsertSchema(fawryBalanceTable).omit({ id: true, createdAt: true });
export const insertFawryTransactionSchema = createInsertSchema(fawryTransactionsTable).omit({ id: true, createdAt: true });
export type InsertFawryBalance = z.infer<typeof insertFawryBalanceSchema>;
export type FawryBalance = typeof fawryBalanceTable.$inferSelect;
export type InsertFawryTransaction = z.infer<typeof insertFawryTransactionSchema>;
export type FawryTransaction = typeof fawryTransactionsTable.$inferSelect;
