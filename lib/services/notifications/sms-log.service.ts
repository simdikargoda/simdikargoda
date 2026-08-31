import "server-only";

import { smsMessages } from "@/db/schema/notification";
import { sendSms } from "@/lib/services/notifications/netgsm.service";

/**
 * SMS gönderim kayıtlarını DB'ye yazan loglayıcı (retry count ile).
 * `sendSms`'e logSms callback'i olarak verilir.
 */
export async function logSmsToDb(input: {
  toPhone: string;
  content: string;
  eventType?: string;
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}): Promise<void> {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  await db.insert(smsMessages).values({
    toPhone: input.toPhone,
    content: input.content,
    eventType: input.eventType,
    status: input.ok ? "sent" : "failed",
    providerMessageId: input.providerMessageId,
    errorMessage: input.error,
    sentAt: input.ok ? new Date() : undefined,
    retryCount: "0",
  });
}

/** Kargo oluşturduktan sonra müşteriye bilgilendirme SMS'i gönderir. */
export async function sendShipmentCreatedSms(input: {
  toPhone: string;
  trackingNumber: string;
  customerId?: string;
}): Promise<void> {
  await sendSms(
    {
      toPhone: input.toPhone,
      content: `Kargonuz oluşturuldu. Takip no: ${input.trackingNumber}`,
      eventType: "shipment_created",
    },
    async (r) => {
      // SMS log'undaki customerId dışında event bağlamı: tracking bilgisi content içinde.
      await logSmsToDb(r);
    }
  );
}

/** Tüm SMS mesajlarını listeler (personel görünümü). */
export async function listSmsMessages(limit = 100) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.smsMessages.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}
