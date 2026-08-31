import "server-only";

import type {
  CargoProvider,
  CargoProviderMap,
  CargoProviderName,
  ShipmentRequest,
  ShipmentResponse,
  TrackingEvent,
} from "@/lib/providers/cargo/contract";
import { isIntegrationConfigured } from "@/lib/config";
import { AppError } from "@/lib/errors";

/**
 * Provider registry.
 *
 * Kural:
 * - Gerçek dış API credential'ı girilmemişse provider `PROVIDER_UNCONFIGURED`
 *   domain hatası döner. ASLA sahte gönderi/takip/barkod/etiket/success üretilmez.
 * - Resmi API sözleşmesi doğrulanmadan endpoint UYDURULMAZ. Bu yüzden Aras/DHL/
 *   HepsiJET/PTT için resmi doküman + production credential temin edilene kadar
 *   tüm operasyonlar `PENDING_PROVIDER_DOCUMENTATION` hatası döner.
 * - API secret/client secret asla request body içine yazılmaz.
 * - `ENABLE_FAKE_CARGO_PROVIDER=true` yalnız development/test ortamında çalışır;
 *   production'da fake provider KESİNLİKLE döndürülmez.
 */

interface ProviderEnv {
  url?: string;
  key?: string;
  secret?: string;
}

function envFor(name: CargoProviderName): ProviderEnv {
  switch (name) {
    case "aras":
      return {
        url: process.env.ARAS_API_URL,
        key: process.env.ARAS_API_KEY,
        secret: process.env.ARAS_API_SECRET,
      };
    case "dhl":
      return {
        url: process.env.DHL_API_URL,
        key: process.env.DHL_API_KEY,
        secret: process.env.DHL_API_SECRET,
      };
    case "hepsijet":
      return {
        url: process.env.HEPSIJET_API_URL,
        key: process.env.HEPSIJET_API_KEY,
        secret: process.env.HEPSIJET_API_SECRET,
      };
    case "ptt":
      return {
        url: process.env.PTT_API_URL,
        key: process.env.PTT_API_KEY,
        secret: process.env.PTT_API_SECRET,
      };
  }
}

/**
 * Uygulama, hiçbir kargo firması için resmi API sözleşmesi içermediğinden
 * gerçek gönderi yaratmaya yönelik hiçbir endpoint çağrısı yapılmaz.
 * Bu koruma, provider contract'ı resmi olarak belgelenene kadar canlıda
 * yanlış/işlevsiz istek atmamayı garanti eder.
 */
function raiseNoContract(name: CargoProviderName): never {
  throw new AppError(
    "PENDING_PROVIDER_DOCUMENTATION",
    `${name} entegrasyonu için resmi API dokümanı ve production credential henüz tanımlanmadı. Bu firmanın entegrasyonu "Doküman Bekleniyor" durumundadır.`,
    503
  );
}

function configuredProvider(name: CargoProviderName): CargoProvider {
  const env = envFor(name);

  const configured = isIntegrationConfigured({
    url: env.url,
    key: env.key,
    secret: env.secret,
  });

  return {
    name,
    async createShipment(_req: ShipmentRequest): Promise<ShipmentResponse> {
      // Firebase ortamında hiçbir provider için resmi contract yoktur:
      // gerçek gönderi oluşturmaya çalışıp yanlış endpoint'e istek atmak yerine
      // açıkça "doküman bekleniyor / yapılandırılmadı" dönmek doğru davranıştır.
      if (!configured) {
        throw new AppError(
          "PROVIDER_UNCONFIGURED",
          `${name} entegrasyonu yapılandırılmadı.`,
          503
        );
      }
      raiseNoContract(name);
    },
    async getTracking(_trackingNumber: string): Promise<TrackingEvent[]> {
      if (!configured) {
        throw new AppError(
          "PROVIDER_UNCONFIGURED",
          `${name} entegrasyonu yapılandırılmadı.`,
          503
        );
      }
      raiseNoContract(name);
    },
    async testConnection(): Promise<void> {
      if (!configured) {
        throw new AppError(
          "PROVIDER_UNCONFIGURED",
          `${name} entegrasyonu yapılandırılmadı.`,
          503
        );
      }
      raiseNoContract(name);
    },
  };
}

/**
 * Dev/test için opt-in sahte provider. Üretimde (NODE_ENV=production)
 * ya da `ENABLE_FAKE_CARGO_PROVIDER=true` değilse KESİNLİKLE kullanılmaz.
 * Fake bile olsa gerçek gönderiyi simüle eden veri üretmez; yalnızca
 * geliştirme akışında deterministik bir referans döndürebilir. Ancak bu
 * fonksiyon production'da döndürülmez.
 */
function devFakeProvider(name: CargoProviderName): CargoProvider {
  let counter = 0;
  return {
    name,
    async createShipment(req) {
      counter += 1;
      const trackingNumber = `FAKE${String(Date.now()).slice(-8)}${String(counter).padStart(4, "0")}`;
      return {
        trackingNumber,
        barcode: trackingNumber,
        labelUrl: undefined,
        providerStatus: "created",
        externalReference: req.externalReference,
      };
    },
    async getTracking(): Promise<TrackingEvent[]> {
      return [];
    },
    async testConnection(): Promise<void> {
      // Dev-only sahte bağlantı testi: her zaman başarılı.
    },
  };
}

/**
 * Çalışma zamanı provider'ını döndürür.
 *
 * - Production: User tarafında yalnız gerçek contract'ı bilinen provider'lar
 *   kullanılır; aksi durumda opsiyonlar PROVIDER_UNCONFIGURED /
 *   PENDING_PROVIDER_DOCUMENTATION döner. Fake asla dönmez.
 * - Dev/test: `ENABLE_FAKE_CARGO_PROVIDER=true` ise fake adapter döndürülebilir.
 */
export function getProvider(name: CargoProviderName): CargoProvider {
  const isProduction = process.env.NODE_ENV === "production";
  const fakeEnabled = process.env.ENABLE_FAKE_CARGO_PROVIDER === "true";

  if (!isProduction && fakeEnabled) {
    return devFakeProvider(name);
  }

  return configuredProvider(name);
}

export function getProviderConfig(name: CargoProviderName): {
  configured: boolean;
  pendingDocumentation: boolean;
} {
  const env = envFor(name);
  const configured = isIntegrationConfigured({
    url: env.url,
    key: env.key,
    secret: env.secret,
  });

  return {
    configured,
    // Resmi doküman/credential bundle olmadan gerçek endpoint kullanmıyoruz.
    pendingDocumentation: !configured,
  };
}

/** Tüm desteklenen provider'ların config durumunu döndürür. */
export function getAllProviderStatuses(): Record<
  CargoProviderName,
  { configured: boolean; pendingDocumentation: boolean }
> {
  return {
    aras: getProviderConfig("aras"),
    dhl: getProviderConfig("dhl"),
    hepsijet: getProviderConfig("hepsijet"),
    ptt: getProviderConfig("ptt"),
  };
}

/** Test/senaryo kapsamı: tüm provider'ları harita olarak döndürür. */
export function getAllProviders(): CargoProviderMap {
  return {
    aras: getProvider("aras"),
    dhl: getProvider("dhl"),
    hepsijet: getProvider("hepsijet"),
    ptt: getProvider("ptt"),
  };
}
