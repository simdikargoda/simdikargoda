"use server";

import { requireStaff } from "@/lib/guard";
import { getDb } from "@/db/client";
import { smsTemplates } from "@/db/schema/notification";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createDefaultTemplates() {
  await requireStaff();
  const db = getDb();
  
  const existing = await db.query.smsTemplates.findMany();
  if (existing.length > 0) return;

  await db.insert(smsTemplates).values([
    {
      eventType: "shipment_created",
      name: "Kargo Oluşturuldu",
      content: "Kargonuz oluşturuldu. Takip no: {trackingNumber}",
      variables: ["trackingNumber", "customerName", "cargoProvider"],
      isActive: true,
    },
    {
      eventType: "shipment_delivered",
      name: "Teslim Edildi",
      content: "Sayın {customerName}, {trackingNumber} nolu kargonuz teslim edilmiştir.",
      variables: ["trackingNumber", "customerName", "deliveryDate"],
      isActive: true,
    },
    {
      eventType: "shipment_problem",
      name: "Teslimat Problemi",
      content: "{trackingNumber} nolu kargonuzda bir problem yaşanmıştır. Lütfen şubenizle iletişime geçin.",
      variables: ["trackingNumber", "customerName", "problemReason"],
      isActive: true,
    }
  ]);
  revalidatePath("/yonetim/bildirimler/sablonlar");
}

export async function updateTemplateAction(id: string, content: string, isActive: boolean) {
  await requireStaff();
  const db = getDb();

  await db.update(smsTemplates)
    .set({ content, isActive, updatedAt: new Date() })
    .where(eq(smsTemplates.id, id));

  revalidatePath("/yonetim/bildirimler/sablonlar");
  return { success: true };
}
