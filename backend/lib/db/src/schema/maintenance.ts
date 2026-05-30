import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const maintenanceTable = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deviceType: text("device_type").notNull(),
  deviceBrand: text("device_brand"),
  issue: text("issue").notNull(),
  password: text("password"),
  notes: text("notes"),
  status: text("status").notNull().default("received"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  finalCost: numeric("final_cost", { precision: 10, scale: 2 }),
  technicianId: integer("technician_id"),
  technicianName: text("technician_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMaintenanceSchema = createInsertSchema(maintenanceTable).omit({ id: true, createdAt: true, updatedAt: true, ticketNumber: true });
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Maintenance = typeof maintenanceTable.$inferSelect;
