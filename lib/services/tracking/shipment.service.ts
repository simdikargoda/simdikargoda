import "server-only";

import { eq } from "drizzle-orm";

import { AppError } from "@/lib/errors";
import { shipments, shipmentStatusHistory } from "@/db/schema/shipment";

export type ShipmentStatus = typeof shipmentStatusHistory.$inferInsert["toStatus"];

export interface CreateShipmentInput {
  customerId: string;
  provider: "aras" | "dhl" | "hepsijet" | "ptt";
  idempotencyKey: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity?: string;
  senderDistrict?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity?: string;
  receiverDistrict?: string;
  packageCount: number;
  desi: number;
  weight: number;
  description?: string;
  salePriceKurus: number;
  costPriceKurus: number;
  createdById?: string;
}

/** Kargo gönderisi oluşturur. Idempotency key unique constraint ile korunur. */
export async function createShipmentRecord(input: CreateShipmentInput) {
  const { getDb } = await import("@/db/client");
  const db = getDb();

  // Idempotency: aynı key tekrar gelirse önceden oluşturulan kaydı döndür.
  const existing = await db.query.shipments.findFirst({
    where: eq(shipments.idempotencyKey, input.idempotencyKey),
  });
  if (existing) {
    throw new AppError(
      "DUPLICATE_REQUEST",
      "Bu gönderi zaten oluşturuldu. Çift kayıt önlendi.",
      409
    );
  }

  return db.transaction(async (tx) => {
    const [shipment] = await tx
      .insert(shipments)
      .values({
        customerId: input.customerId,
        provider: input.provider,
        idempotencyKey: input.idempotencyKey,
        status: "created",
        salePriceKurus: input.salePriceKurus,
        costPriceKurus: input.costPriceKurus,
        senderName: input.senderName,
        senderPhone: input.senderPhone,
        senderAddress: input.senderAddress,
        senderCity: input.senderCity ?? null,
        senderDistrict: input.senderDistrict ?? null,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        receiverAddress: input.receiverAddress,
        receiverCity: input.receiverCity ?? null,
        receiverDistrict: input.receiverDistrict ?? null,
        packageCount: input.packageCount,
        desi: input.desi,
        weight: input.weight,
        description: input.description,
        createdById: input.createdById,
      })
      .returning();

    await tx.insert(shipmentStatusHistory).values({
      shipmentId: shipment.id,
      fromStatus: null,
      toStatus: "created",
      source: "system",
      note: "Gönderi oluşturuldu",
    });

    return shipment;
  });
}

/** Idempotency anahtarının daha önce kullanıldığını kontrol eder. */
export async function shipmentWithIdempotencyKeyExists(key: string): Promise<boolean> {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const row = await db.query.shipments.findFirst({
    where: eq(shipments.idempotencyKey, key),
  });
  return Boolean(row);
}
