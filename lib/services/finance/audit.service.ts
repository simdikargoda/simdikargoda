import { auditLogs } from "@/db/schema/integration";
import type { Database } from "@/db/client";
import { eq } from "drizzle-orm";

export type DbTx = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * Kritik yönetim işlemlerinin audit izini oluşturur.
 * Hassas secret değerler asla `meta` içine yazılmaz.
 */
export async function writeAuditLog(input: {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  customerId?: string;
  meta?: Record<string, unknown>;
  tx?: DbTx;
}): Promise<void> {
  const data = {
    actorUserId: input.actorUserId ?? undefined,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    customerId: input.customerId ?? undefined,
    raw: input.meta,
  };

  if (input.tx) {
    await input.tx.insert(auditLogs).values(data);
    return;
  }

  const { getDb } = await import("@/db/client");
  await getDb().insert(auditLogs).values(data);
}

/** Son audit kayıtlarını listeler. */
export async function getAuditLogs(limit = 50) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.auditLogs.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

export async function getAuditLogsForCustomer(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.auditLogs.findMany({
    where: eq(auditLogs.customerId, customerId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}
