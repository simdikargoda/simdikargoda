"use server";

import { z } from "zod";

import { requireStaff } from "@/lib/guard";
import { AppError } from "@/lib/errors";
import { assertCustomerScope } from "@/lib/guard";
import { createShipment } from "@/lib/services/shipment/create-shipment.service";
import { getCustomerOptions } from "@/lib/queries/customer.queries";

const createShipmentSchema = z.object({
  customerId: z.string().min(1, "Müşteri seçin."),
  provider: z.enum(["aras", "dhl", "hepsijet", "ptt"]),
  senderName: z.string().min(2),
  senderPhone: z.string().min(7),
  senderAddress: z.string().min(5),
  senderCity: z.string().optional(),
  senderDistrict: z.string().optional(),
  receiverName: z.string().min(2),
  receiverPhone: z.string().min(7),
  receiverAddress: z.string().min(5),
  receiverCity: z.string().optional(),
  receiverDistrict: z.string().optional(),
  packageCount: z.coerce.number().int().min(1),
  desi: z.coerce.number().int().min(1),
  weight: z.coerce.number().int().min(1),
  description: z.string().optional(),
});

export type CreateShipmentState = {
  error?: string;
  shipmentId?: string;
  trackingNumber?: string;
};

export async function createShipmentAction(
  _prev: CreateShipmentState,
  formData: FormData
): Promise<CreateShipmentState> {
  const session = await requireStaff();

  try {
    const parsed = createShipmentSchema.safeParse({
      customerId: formData.get("customerId"),
      provider: formData.get("provider"),
      senderName: formData.get("senderName"),
      senderPhone: formData.get("senderPhone"),
      senderAddress: formData.get("senderAddress"),
      senderCity: formData.get("senderCity") || undefined,
      senderDistrict: formData.get("senderDistrict") || undefined,
      receiverName: formData.get("receiverName"),
      receiverPhone: formData.get("receiverPhone"),
      receiverAddress: formData.get("receiverAddress"),
      receiverCity: formData.get("receiverCity") || undefined,
      receiverDistrict: formData.get("receiverDistrict") || undefined,
      packageCount: formData.get("packageCount"),
      desi: formData.get("desi"),
      weight: formData.get("weight"),
      description: formData.get("description") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Geçersiz gönderi bilgisi." };
    }

    const data = parsed.data;
    // Tenant: personel herhangi bir müşteri için oluşturabilir; isolation guard ile.
    assertCustomerScope(data.customerId, session);

    // İstemci tarafında üretilen, gönderiyi benzersiz kılan idempotency anahtarı.
    const idempotencyKey = `staff:${session.userId}:${Date.now()}:${data.customerId}:${data.receiverPhone}`;

    const shipment = await createShipment({ ...data, idempotencyKey });
    
    return {
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber ?? undefined,
    };
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "Gönderi oluşturulurken bir hata oluştu." };
  }
}
