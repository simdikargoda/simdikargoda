import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import { AppError } from "@/lib/errors";
import { applyShipmentStatus } from "@/lib/services/tracking/tracking.service";
import { normalizeStatus } from "@/lib/providers/cargo/status-map";

/**
 * Webhook endpoint yardımcıları.
 *
 * - Signature doğrulaması (destekleniyorsa): `x-webhook-signature` başlığı,
 *   HMAC-SHA256 ile doğrulanır; secret WEBHOOK_SECRET'ten gelir.
 * - Her gönderi/provided gönderi event'i idempotent işlenir (applyShipmentStatus
 *   aynı duruma düşen event'i atlar, duplicate history üretmez).
 * - Provider durumları common status modeline normalize edilir.
 */

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** HMAC doğrulaması — imza eşleşmezse AppError fırlatır. */
export function verifyWebhookSignature(signature: string | undefined, expected: string): void {
  if (!signature) {
    throw new AppError("FORBIDDEN", "Webhook imzası eksik.", 403);
  }
  if (!safeEqual(signature, expected)) {
    throw new AppError("FORBIDDEN", "Geçersiz webhook imzası.", 403);
  }
}

/** Raw body'den HMAC-SHA256 hesaplar (secret WEBHOOK_SECRET). */
export function computeWebhookSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export interface WebhookShipmentEvent {
  provider: string;
  trackingNumber: string;
  status: string;
  occurredAt?: string;
  description?: string;
}

/**
 * Kargo firması webhook event'ini işler.
 * shipment'ı trackingNumber ile bulur; bulunamazsa NOT_FOUND (silent ignore için çağıran yönetir).
 */
export async function processShipmentWebhook(
  event: WebhookShipmentEvent,
  source = "webhook"
): Promise<{ changed: boolean }> {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const shipment = await db.query.shipments.findFirst({
    where: (table, ops) => ops.eq(table.trackingNumber, event.trackingNumber),
  });
  if (!shipment) {
    throw new AppError("NOT_FOUND", "Webhook için gönderi bulunamadı.", 404);
  }

  const normalized = normalizeStatus(event.status, event.provider);
  return applyShipmentStatus({
    shipmentId: shipment.id,
    newStatus: normalized,
    providerStatus: event.status,
    source: source as "webhook",
    note: event.description,
  });
}
