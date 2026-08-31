import "server-only";

import { isIntegrationConfigured } from "@/lib/config";

/**
 * Netgsm SMS entegrasyonu (config-driven).
 *
 * Credential'lar girilmediyse `configured=false` döner ve SMS gönderimi
 * yapılmaz; sistem crash olmaz. Gönderim sonuçları saklanmak üzere
 * `logSms` callback'ine iletilir (retry/failure senaryoları için).
 *
 * SMS işlemleri ana HTTP isteğini yavaşlatmayacak şekilde tasarlanır:
 * çağıran taraf (background job / fire-and-forget) bunu enqueue eder.
 */

export interface SendSmsInput {
  toPhone: string;
  content: string;
  eventType?: string;
}

export function netgsmConfigured(): boolean {
  return isIntegrationConfigured({
    usercode: process.env.NETGSM_USERCODE,
    password: process.env.NETGSM_PASSWORD,
    header: process.env.NETGSM_HEADER,
  });
}

/**
 * Netgsm HTTP endpoint'ine gönderir. `logSms` sağlanırsa sonucu kaydeder.
 * Döner: { ok, providerMessageId?, error? }
 */
export async function sendSms(
  input: SendSmsInput,
  logSms?: (result: {
    toPhone: string;
    content: string;
    eventType?: string;
    ok: boolean;
    providerMessageId?: string;
    error?: string;
  }) => Promise<void> | void
): Promise<{ ok: boolean; providerMessageId?: string; error?: string }> {
  if (!netgsmConfigured()) {
    const result = { ok: false, error: "Netgsm yapılandırılmadı." };
    if (logSms) await logSms({ ...input, ...result });
    return result;
  }

  try {
    const url = new URL("https://api.netgsm.com.tr/sms/send/get");
    url.searchParams.set("usercode", process.env.NETGSM_USERCODE ?? "");
    url.searchParams.set("password", process.env.NETGSM_PASSWORD ?? "");
    url.searchParams.set("gsmno", input.toPhone);
    url.searchParams.set("text", input.content);
    url.searchParams.set("msgheader", process.env.NETGSM_HEADER ?? "");

    const res = await fetch(url.toString(), { method: "GET" });
    const body = await res.text();

    // Netgsm başarı yanıtı: "00" ile başlar (code + message id).
    const ok = body.startsWith("00");
    const providerMessageId = ok ? body.split(" ")[1] : undefined;
    const error = ok ? undefined : `Netgsm yanıtı: ${body.slice(0, 100)}`;

    const result = { ok, providerMessageId, error };
    if (logSms) await logSms({ ...input, ...result });
    return result;
  } catch (err) {
    const result = {
      ok: false,
      error: err instanceof Error ? err.message : "Netgsm bağlantı hatası",
    };
    if (logSms) await logSms({ ...input, ...result });
    return result;
  }
}
