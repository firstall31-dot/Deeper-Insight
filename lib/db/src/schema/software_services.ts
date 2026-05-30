import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const softwareServicesTable = pgTable("software_services", {
  id: serial("id").primaryKey(),
  serviceType: text("service_type").notNull(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deviceBrand: text("device_brand"),
  deviceModel: text("device_model"),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0"),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }).notNull().default("0"),
  technicianId: integer("technician_id"),
  technicianName: text("technician_name"),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSoftwareServiceSchema = createInsertSchema(softwareServicesTable).omit({ id: true, createdAt: true });
export type InsertSoftwareService = z.infer<typeof insertSoftwareServiceSchema>;
export type SoftwareService = typeof softwareServicesTable.$inferSelect;
