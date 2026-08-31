import { and, eq, sql } from "drizzle-orm";

import { balanceRequests } from "@/db/schema/finance";
import { AppError } from "@/lib/errors";
import { applyBalanceDelta, type DbTx } from "@/lib/services/finance/balance.service";
import { writeAuditLog } from "@/lib/services/finance/audit.service";

/**
 * Bakiye yükleme talebi (havale) akışı.
 * Onaylanmadan bakiye kullanılabilir hale gelmez.
 * Aynı talep iki kez onaylanamaz.
 */

export async function createBalanceRequest(input: {
  customerId: string;
  requestedByUserId: string;
  amountKurus: number;
  bankReference?: string;
  note?: string;
}) {
  if (!Number.isInteger(input.amountKurus) || input.amountKurus <= 0) {
    throw new AppError("VALIDATION_ERROR", "Geçersiz bakiye yükleme tutarı.", 400);
  }

  const { getDb } = await import("@/db/client");
  const db = getDb();

  const [req] = await db
    .insert(balanceRequests)
    .values({
      customerId: input.customerId,
      requestedByUserId: input.requestedByUserId,
      amountKurus: input.amountKurus,
      bankReference: input.bankReference,
      note: input.note,
    })
    .returning();
  return req;
}

export async function approveBalanceRequest(input: {
  requestId: string;
  approvedById: string;
}) {
  const { getDb } = await import("@/db/client");
  const db = getDb();

  await db.transaction(async (tx) => {
    const txRef = tx as unknown as DbTx;

    // Talep satırını FOR UPDATE ile kilitle — çift onayı önler.
    const res = await tx.execute(
      sql`SELECT id, customer_id, amount_kurus, status FROM balance_requests WHERE id = ${input.requestId} FOR UPDATE`
    );
    const rows = (res as unknown as { rows: { customer_id: string; amount_kurus: unknown; status: string }[] }).rows;
    const req = rows[0];
    if (!req) {
      throw new AppError("NOT_FOUND", "Bakiye yükleme talebi bulunamadı.", 404);
    }
    if (req.status !== "pending") {
      throw new AppError(
        "CONFLICT",
        "Bu talep zaten işleme alınmış.",
        409
      );
    }

    // Durumu onaylandı olarak işaretle.
    const updated = await tx
      .update(balanceRequests)
      .set({
        status: "approved",
        approvedById: input.approvedById,
        approvedAt: new Date(),
      })
      .where(eq(balanceRequests.id, input.requestId))
      .returning();

    const approved = updated[0];

    // Bakiyeye tutarı ekle.
    await applyBalanceDelta({
      customerId: req.customer_id,
      type: "deposit",
      deltaKurus: Number(req.amount_kurus),
      referenceType: "deposit",
      referenceId: approved.id,
      description: approved.note ?? "Havale ile bakiye yükleme",
      performedById: input.approvedById,
      tx: txRef,
    });

    await writeAuditLog({
      actorUserId: input.approvedById,
      action: "balance_request.approved",
      entityType: "balance_request",
      entityId: approved.id,
      customerId: approved.customerId,
      meta: { amountKurus: approved.amountKurus },
      tx: txRef,
    });
  });
}

/** Bekleyen bakiye yükleme taleplerini listeler. */
export async function getPendingBalanceRequests() {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.balanceRequests.findMany({
    where: eq(balanceRequests.status, "pending"),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
}

/** Müşterinin bakiye yükleme taleplerini listeler. */
export async function getBalanceRequestsForCustomer(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.balanceRequests.findMany({
    where: and(eq(balanceRequests.customerId, customerId)),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}
