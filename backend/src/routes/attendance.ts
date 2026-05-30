import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, employeeAttendanceTable, employeesTable } from "@workspace/db";
import { mapAttendance } from "../lib/mappers";
import { parseId } from "../lib/helpers";

const router = Router();

const VALID_STATUS = ["present", "absent", "late", "half_day"] as const;

function isValidStatus(v: unknown): v is typeof VALID_STATUS[number] {
  return typeof v === "string" && (VALID_STATUS as readonly string[]).includes(v);
}

router.get("/employees/:id/attendance", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const { month } = req.query as { month?: string };

  const rows = await db.select().from(employeeAttendanceTable)
    .where(eq(employeeAttendanceTable.employeeId, id))
    .orderBy(employeeAttendanceTable.date);

  const filtered = month ? rows.filter(r => r.date.startsWith(month)) : rows;
  res.json(filtered.map(mapAttendance));
});

router.post("/employees/:id/attendance", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const { date, checkIn, checkOut, status = "present", notes } = req.body as Record<string, string | undefined>;

  if (!date || typeof date !== "string") {
    res.status(400).json({ error: "date is required (YYYY-MM-DD)" });
    return;
  }
  if (!isValidStatus(status)) {
    res.status(400).json({ error: "status must be one of: present, absent, late, half_day" });
    return;
  }

  const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, id));
  if (!employee) { res.status(404).json({ error: "Employee not found" }); return; }

  const [record] = await db.insert(employeeAttendanceTable).values({
    employeeId: id,
    employeeName: employee.name,
    date,
    checkIn: checkIn ?? null,
    checkOut: checkOut ?? null,
    status,
    notes: notes ?? null,
  }).returning();

  res.status(201).json(mapAttendance(record));
});

router.patch("/employees/:employeeId/attendance/:id", async (req, res): Promise<void> => {
  const id = parseId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const { checkIn, checkOut, status, notes } = req.body as Record<string, string | undefined>;

  if (status !== undefined && !isValidStatus(status)) {
    res.status(400).json({ error: "status must be one of: present, absent, late, half_day" });
    return;
  }

  const updateData: Record<string, string | null> = {};
  if (checkIn !== undefined) updateData.checkIn = checkIn;
  if (checkOut !== undefined) updateData.checkOut = checkOut;
  if (status !== undefined) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const [record] = await db.update(employeeAttendanceTable)
    .set(updateData)
    .where(eq(employeeAttendanceTable.id, id))
    .returning();

  if (!record) { res.status(404).json({ error: "Record not found" }); return; }
  res.json(mapAttendance(record));
});

export default router;
