import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { AppError } from "@/lib/errors";
import { shipments, shipmentStatusHistory } from "@/db/schema/shipment";
import { normalizeStatus } from "@/lib/providers/cargo/status-map";
import { getProvider } from "@/lib/providers/cargo/registry";
import type { NormalizedStatus } from "@/lib/providers/cargo/contract";

export interface ShipmentStatusUpdate {
  shipmentId: string;
  newStatus: NormalizedStatus;
  providerStatus?: string;
  source: "webhook" | "polling" | "manual" | "system";
  note?: string;
}

/**
 * Gönderi durum geçmişini günceller ve status history kayıtları oluşturur.
 * Aynı duruma dönen provider event'leri duplicate history üretmez (idempotent).
 * Durum değişimi varsa shipment.status güncellenir.
 */
export async function applyShipmentStatus(
  input: ShipmentStatusUpdate
): Promise<{ changed: boolean }> {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const normalized: NormalizedStatus | undefined = normalizeStatus(
    input.providerStatus ?? input.newStatus,
    // Provider adını almak için shipment'tan; fallback olarak newStatus kullanılır.
    (await db.query.shipments.findFirst({ where: eq(shipments.id, input.shipmentId) }))?.provider ?? ""
  );

  const usedStatus = normalized ?? input.newStatus;

  const shipment = await db.query.shipments.findFirst({
    where: eq(shipments.id, input.shipmentId),
  });
  if (!shipment) {
    throw new AppError("NOT_FOUND", "Gönderi bulunamadı.", 404);
  }

  if (shipment.status === usedStatus) {
    return { changed: false };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(shipments)
      .set({ status: usedStatus, updatedAt: new Date() })
      .where(eq(shipments.id, input.shipmentId));

    await tx.insert(shipmentStatusHistory).values({
      shipmentId: input.shipmentId,
      fromStatus: shipment.status,
      toStatus: usedStatus,
      providerStatus: input.providerStatus ?? null,
      source: input.source,
      note: input.note,
    });
  });

  return { changed: true };
}

/** Bir gönderinin status geçmişini döndürür. */
export async function getShipmentHistory(shipmentId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.shipmentStatusHistory.findMany({
    where: eq(shipmentStatusHistory.shipmentId, shipmentId),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
}

/** Güncel provider durumunu çekip uygular (polling). */
export async function pollAndApplyStatus(shipmentId: string): Promise<{ changed: boolean }> {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const shipment = await db.query.shipments.findFirst({
    where: eq(shipments.id, shipmentId),
  });
  if (!shipment) {
    throw new AppError("NOT_FOUND", "Gönderi bulunamadı.", 404);
  }
  if (!shipment.trackingNumber) {
    throw new AppError("CONFLICT", "Gönderinin takip numarası yok.", 409);
  }

  const provider = getProvider(shipment.provider);
  const events = await provider.getTracking(shipment.trackingNumber);
  const latest = events[events.length - 1];
  if (!latest) return { changed: false };

  return applyShipmentStatus({
    shipmentId,
    newStatus: latest.normalizedStatus,
    providerStatus: latest.providerStatus,
    source: "polling",
    note: latest.description,
  });
}

/** Filtre + arama destekli gönderi listesi (liste ekranı için). */
export async function listShipments(input: {
  customerId?: string;
  status?: string;
  provider?: string;
  q?: string;
  limit?: number;
  offset?: number;
}) {
  const { getDb } = await import("@/db/client");
  const db = getDb();

  const conditions = [];
  if (input.customerId) conditions.push(eq(shipments.customerId, input.customerId));
  if (input.status) conditions.push(eq(shipments.status, input.status as never));
  if (input.provider) conditions.push(eq(shipments.provider, input.provider as never));

  const rows = await db.query.shipments.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
  });

  // Arama (q): takip numarası, barkod, alıcı adı üzerinde — küçük liste için uygun.
  if (input.q) {
    const q = input.q.toLowerCase();
    return rows.filter(
      (r) =>
        r.trackingNumber?.toLowerCase().includes(q) ||
        r.barcode?.toLowerCase().includes(q) ||
        r.receiverName.toLowerCase().includes(q)
    );
  }
  return rows;
}
