/**
 * Shared route utilities — ID parsing and unique code generators.
 * Import from here; never define locally in a route file.
 */

/**
 * Parse a string path parameter as a positive integer.
 * Returns null when the input is not a valid positive integer.
 */
export function parseId(s: string): number | null {
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Generate a unique invoice number: INV-YYYYMMDD-XXXX
 */
export function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10_000).toString().padStart(4, "0");
  return `INV-${dateStr}-${rand}`;
}

// In-process counter — resets on server restart (intentional: counter is for human readability only)
let _ticketCounter = 1000;

/**
 * Generate a unique maintenance ticket number: MNT-XXXX
 */
export function generateTicketNumber(): string {
  _ticketCounter++;
  return `MNT-${_ticketCounter}`;
}
