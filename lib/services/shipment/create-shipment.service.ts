import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { AppError } from "@/lib/errors";
import { shipments, shipmentStatusHistory } from "@/db/schema/shipment";
import { customers } from "@/db/schema/customer";
import { resolvePrice, type CargoProvider } from "@/lib/services/pricing.service";
import type { ShipmentRequest } from "@/lib/providers/cargo/contract";
import { getProvider } from "@/lib/providers/cargo/registry";
import { getBalance, applyBalanceDelta, type DbTx } from "@/lib/services/finance/balance.service";
import { applyCurrentAccountDelta } from "@/lib/services/finance/current-account.service";
import { writeAuditLog } from "@/lib/services/finance/audit.service";
import { getCurrentSession } from "@/lib/auth";
import { assertCustomerScope } from "@/lib/guard";

export interface CreateShipmentInput {
  customerId: string;
  provider: CargoProvider;
  idempotencyKey: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageCount: number;
  desi: number;
  weight: number;
  description?: string;
}

/**
 * Kargo gönderisi oluşturur ve tüm yan etkileri (fiyat çözümleme, bakiye/cari
 * hareketi, status history, audit) tek transaction sınırı içinde yönetir.
 *
 * Adımlar (prompt'un FAZ 6 sırasına uygun):
 * 1. Yetki doğrula (auth + tenant/customer scope)
 * 2. Input doğrula
 * 3. Fiyatı çöz (backend'de hesaplanır — frontend'e güvenilmez)
 * 4. Bakiye/cari uygunluğunu kontrol et (limit backend'de)
 * 5. Kargo provider işlemi
 * 6. Gönderiyi kaydet (idempotency + price snapshot)
 * 7. Finansal hareketi güvenli biçimde oluştur
 * 8. Status history + audit
 *
 * Idempotency, shipments.idempotency_key unique constraint ile korunur.
 * Harici API çağrısı DB transaction'ı içinde uzun süre lock tutamayacağı için
 * provider işlemi ÖNCE gerçekleştirilir; başarısız/provider hatasında DB'ye
 * yazılmaz. Provider işlemi başarılı olup DB'ye yazılırsa tutarlıdır; yazma
 * hatasında shutdown sırasında tekrar deneme yapılamaz (kabul edilebilir).
 */
export async function createShipment(input: CreateShipmentInput) {
  const session = await getCurrentSession();
  if (!session) {
    throw new AppError("UNAUTHORIZED", "Giriş yapmanız gerekir.", 401);
  }
  assertCustomerScope(input.customerId, session);

  // Adım 3: Fiyatı çöz.
  const price = await resolvePrice({
    customerId: input.customerId,
    provider: input.provider,
    weight: input.weight,
    desi: input.desi,
  });

  const db = getDb();
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, input.customerId),
  });
  if (!customer) {
    throw new AppError("NOT_FOUND", "Müşteri bulunamadı.", 404);
  }
  if (customer.status !== "active") {
    throw new AppError("CONFLICT", "Pasif müşteri kargo oluşturamaz.", 409);
  }

  // Idempotency kontrolü — unique constraint yedek güvence olarak DB'de.
  const existing = await db.query.shipments.findFirst({
    where: eq(shipments.idempotencyKey, input.idempotencyKey),
  });
  if (existing) {
    throw new AppError("DUPLICATE_REQUEST", "Bu gönderi zaten oluşturulmuş.", 409);
  }

  // Adım 5: Provider işlemini transaction DIŞINDA gerçekleştir (lock uzun tutulmaz).
  const provider = getProvider(input.provider);
  const request: ShipmentRequest = {
    externalReference: input.idempotencyKey,
    senderName: input.senderName,
    senderPhone: input.senderPhone,
    senderAddress: input.senderAddress,
    receiverName: input.receiverName,
    receiverPhone: input.receiverPhone,
    receiverAddress: input.receiverAddress,
    packageCount: input.packageCount,
    desi: input.desi,
    weight: input.weight,
    description: input.description,
  };
  let providerResult;
  try {
    providerResult = await provider.createShipment(request);
  } catch {
    throw new AppError(
      "PROVIDER_ERROR",
      `Kargo firması (${input.provider}) geçici olarak yanıt vermiyor. Lütfen tekrar deneyin.`,
      503
    );
  }

  // Adım 4+6+7+8: DB transaction'ı — shipment + finans + history + audit.
  const result = await db.transaction(async (tx) => {
    const txRef = tx as unknown as DbTx;

    // Idempotency tekrar kontrol (concurrent çift isteğin unique ihlaliyle patlamasın).
    const dup = await tx.query.shipments.findFirst({
      where: eq(shipments.idempotencyKey, input.idempotencyKey),
    });
    if (dup) {
      throw new AppError("DUPLICATE_REQUEST", "Bu gönderi zaten oluşturulmuş.", 409);
    }

    // Adım 4: Bakiye/cari uygunluğunu kontrol et ve finansal hareketi oluştur.
    if (customer.type === "balance") {
      const balance = await getBalance(input.customerId);
      if (balance < price.salePriceKurus) {
        throw new AppError(
          "INSUFFICIENT_BALANCE",
          "Bakiye yetersiz. Bakiye yükleyip tekrar deneyin.",
          400
        );
      }
      await applyBalanceDelta({
        customerId: input.customerId,
        type: "shipment_fee",
        deltaKurus: -price.salePriceKurus,
        referenceType: "shipment",
        description: "Kargo ücreti",
        performedById: session.userId,
        tx: txRef,
      });
    } else {
      await applyCurrentAccountDelta({
        customerId: input.customerId,
        type: "shipment_debit",
        deltaKurus: price.salePriceKurus,
        referenceType: "shipment",
        description: "Kargo bedeli (cari)",
        performedById: session.userId,
        tx: txRef,
        checkLimit: true,
      });
    }

    // Adım 6: Gönderiyi kaydet.
    const [shipment] = await tx
      .insert(shipments)
      .values({
        customerId: input.customerId,
        provider: input.provider,
        trackingNumber: providerResult.trackingNumber,
        barcode: providerResult.barcode,
        labelUrl: providerResult.labelUrl ?? null,
        status: "created",
        externalReference: providerResult.externalReference,
        idempotencyKey: input.idempotencyKey,
        salePriceKurus: price.salePriceKurus, // snapshot
        costPriceKurus: price.costPriceKurus, // snapshot
        senderName: input.senderName,
        senderPhone: input.senderPhone,
        senderAddress: input.senderAddress,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        receiverAddress: input.receiverAddress,
        packageCount: input.packageCount,
        desi: input.desi,
        weight: input.weight,
        description: input.description,
        createdById: session.userId,
      })
      .returning();

    // Adım 8: Status history + audit.
    await tx.insert(shipmentStatusHistory).values({
      shipmentId: shipment.id,
      fromStatus: null,
      toStatus: "created",
      providerStatus: providerResult.providerStatus,
      source: "system",
      note: "Gönderi oluşturuldu",
    });

    await writeAuditLog({
      actorUserId: session.userId,
      action: "shipment.created",
      entityType: "shipment",
      entityId: shipment.id,
      customerId: input.customerId,
      meta: {
        provider: input.provider,
        salePriceKurus: price.salePriceKurus,
        trackingNumber: providerResult.trackingNumber,
      },
      tx: txRef,
    });

    return shipment;
  });

  // SMS Bildirimi (Fire and forget - İşlemi bloklamaz, gerçek Netgsm servisi)
  const smsLog = await import("@/lib/services/notifications/sms-log.service");
  smsLog
    .sendShipmentCreatedSms({
      toPhone: result.receiverPhone,
      trackingNumber: result.trackingNumber ?? result.id,
      customerId: input.customerId,
    })
    .catch((err: unknown) =>
      console.error("SMS gönderim hatası:", err instanceof Error ? err.message : err)
    );

  return result;
}
