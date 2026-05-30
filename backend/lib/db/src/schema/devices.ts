import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const devicesTable = pgTable("devices", {
  id: serial("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  color: text("color"),
  storage: text("storage"),
  imei1: text("imei1").notNull(),
  imei2: text("imei2"),
  serialNumber: text("serial_number"),
  condition: text("condition").notNull().default("new"),
  purchaseDate: text("purchase_date").notNull(),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull().default("0"),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  supplierId: integer("supplier_id"),
  sold: boolean("sold").notNull().default(false),
  soldAt: text("sold_at"),
  customerId: integer("customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ id: true, createdAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
