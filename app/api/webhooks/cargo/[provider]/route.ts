import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getDb } from "@/db/client";
import { AppError } from "@/lib/errors";
import { integrations } from "@/db/schema/integration";
import {
  computeWebhookSignature,
  verifyWebhookSignature,
  processShipmentWebhook,
  type WebhookShipmentEvent,
} from "@/lib/services/tracking/webhook.service";

/**
 * Kargo firması webhook callback endpoint'i (public).
 *
 * Normalize public contract:
 *   POST /api/webhooks/cargo/:provider
 *
 * Güvenlik & bütünlük:
 * - Yalnızca allowlist içindeki provider'lar kabul edilir.
 * - `WEBHOOK_SECRET` tanımlı olduğunda `x-webhook-signature` (HMAC-SHA256)
 *   doğrulanır. Tanımlı değilken webhook işlenmez (ör. provider HMAC
 *   desteklemiyorsa resmi contract'a göre ayrıca yapılandırılmalıdır).
 * - Event idempotent işlenir; duplicate event güvenli 2xx döner.
 * - Bilinmeyen gönderi sessizce yoksayılır (4xx yanıtı provider'ı tetiklemez).
 * - Hızlı yanıt: iş uzun sürmediği için senkron işlenir.
 */

const ALLOWED_PROVIDERS = ["aras", "dhl", "hepsijet", "ptt"] as const;
type AllowedProvider = (typeof ALLOWED_PROVIDERS)[number];

function matchesProvider(p: string): p is AllowedProvider {
  return (ALLOWED_PROVIDERS as readonly string[]).includes(p);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  try {
    if (!matchesProvider(provider)) {
      return NextResponse.json({ error: "unsupported_provider" }, { status: 404 });
    }

    const raw = await req.text();
    // HMAC modeli zorunlu olmadığında bile boş payload kabul edilmez.
    if (!raw.trim()) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      // Güvenli olmayan ortamda webhook aktifleştirilmez.
      return NextResponse.json(
        { error: "webhook_not_configured" },
        { status: 503 }
      );
    }

    // HMAC doğrulaması.
    const signature = req.headers.get("x-webhook-signature") ?? undefined;
    const expected = computeWebhookSignature(raw, secret);
    verifyWebhookSignature(signature, expected);

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const event = payload as Partial<WebhookShipmentEvent> & {
      data?: Partial<WebhookShipmentEvent>;
    };

    const providerField = String(event.provider ?? provider);
    if (providerField !== provider) {
      return NextResponse.json({ error: "provider_mismatch" }, { status: 400 });
    }
    if (!event.trackingNumber) {
      return NextResponse.json({ error: "missing_tracking" }, { status: 400 });
    }
    // Event'e özgü idempotency/dedup anahtarı (opsiyonel).
    const eventId = String(event.trackingNumber);

    const { changed } = await processShipmentWebhook({
      provider,
      trackingNumber: event.trackingNumber,
      status: String(event.status ?? ""),
      occurredAt: event.occurredAt,
      description: event.description,
    });

    // Bilinen ve başarılı event → integration log'u güncelle.
    await getDb()
      .insert(integrations)
      .values({
        provider,
        status: "active",
        configured: true,
        lastTestAt: new Date(),
        lastTestResult: { ok: true, eventId, changed },
      })
      .onConflictDoUpdate({
        target: integrations.provider,
        set: {
          status: "active",
          lastTestAt: new Date(),
          lastTestResult: { ok: true, eventId, changed },
        },
      });

    return NextResponse.json({ ok: true, changed }, { status: 200 });
  } catch (err) {
    if (err instanceof AppError) {
      if (err.code === "FORBIDDEN" || err.code === "UNAUTHORIZED") {
        return NextResponse.json({ error: "invalid_signature" }, { status: 403 });
      }
      if (err.code === "NOT_FOUND") {
        // Bilinmeyen gönderi — sessizce yoksay, provider'a 2xx dön.
        return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
      }
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    console.error("Webhook işleme hatası:", err);
    // Stack trace veya secret dışarı sızmasın.
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

/** Sunucu tarafında yalnızca POST kabul edilir. */
export async function GET() {
  return NextResponse.json({ error: "method_not_allowed" }, { status: 405 });
}
