import { pgTable, text, serial, timestamp, integer, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeeAttendanceTable = pgTable("employee_attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  employeeName: text("employee_name").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  checkIn: text("check_in"),   // HH:MM
  checkOut: text("check_out"), // HH:MM
  status: text("status").notNull().default("present"), // present | absent | late | half_day
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAttendanceSchema = createInsertSchema(employeeAttendanceTable).omit({ id: true, createdAt: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type EmployeeAttendance = typeof employeeAttendanceTable.$inferSelect;
