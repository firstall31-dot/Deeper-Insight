import type { Request, Response, NextFunction } from "express";
import { db, auditLogTable } from "@workspace/db";

/**
 * Audit middleware — logs every mutating request (POST, PATCH, PUT, DELETE)
 * to the audit_log table after the response is sent.
 *
 * Entity and entityId are derived from the URL path.
 * Attach `req.auditContext` in route handlers to enrich the log entry.
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auditContext?: {
        userId?: number;
        userName?: string;
        entityId?: string | number;
      };
    }
  }
}

function entityFromPath(path: string): { entity: string; entityId: string | undefined } {
  // Remove /api prefix and leading slash
  const clean = path.replace(/^\/api\//, "").replace(/^\//, "");
  const parts = clean.split("/");
  // e.g. "products/5" -> entity=product, entityId=5
  // "wallets/3/transactions" -> entity=wallet_transaction, entityId=3
  const entity = parts[0]?.replace(/-/g, "_").replace(/s$/, "") ?? "unknown";
  const entityId = parts[1] && !isNaN(Number(parts[1])) ? parts[1] : undefined;
  return { entity, entityId };
}

const METHOD_ACTION: Record<string, string> = {
  POST: "CREATE",
  PATCH: "UPDATE",
  PUT: "UPDATE",
  DELETE: "DELETE",
};

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  const action = METHOD_ACTION[req.method];
  if (!action) {
    next();
    return;
  }

  // Run after response
  res.on("finish", () => {
    if (res.statusCode >= 400) return; // don't log failed mutations
    const { entity, entityId } = entityFromPath(req.path);
    const ctx = req.auditContext ?? {};

    db.insert(auditLogTable).values({
      userId: ctx.userId ?? null,
      userName: ctx.userName ?? "system",
      action,
      entity,
      entityId: String(ctx.entityId ?? entityId ?? ""),
      details: { method: req.method, path: req.path, status: res.statusCode },
      ipAddress: req.ip ?? null,
    }).catch(() => {
      // Audit log failures must never crash the main request
    });
  });

  next();
}
