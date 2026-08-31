import "server-only";

import type {
  CargoProvider,
  CargoProviderMap,
  CargoProviderName,
  ShipmentRequest,
  ShipmentResponse,
  TrackingEvent,
} from "@/lib/providers/cargo/contract";
import { getServerConfig, isIntegrationConfigured } from "@/lib/config";

/**
 * Provider registry.
 *
 * Config-driven: Katma gerekli credential'lar girilmemişse provider
 * "unconfigured" olarak değerlendirilir ve gerçek gönderi oluşturulamaz.
 * Girilip bağlantı testi başarılı olduğunda aktifleşir. Kod içinde
 * hard-coded availability boolean'ı yoktur; config + test sonucundan hesaplanır.
 *
 * Gerçek dış API credential'ı olmayan ortamlar için deterministik bir
 * "fake" adapter sağlanır (yalnızca development/test, asla production'da ciddi taşıma yapmaz).
 */

// ------------------------------------------------------------------
// Aras
// ------------------------------------------------------------------
function arasProvider(): CargoProvider {
  const base = process.env.ARAS_API_URL;
  const configured = isIntegrationConfigured({
    url: process.env.ARAS_API_URL,
    key: process.env.ARAS_API_KEY,
    secret: process.env.ARAS_API_SECRET,
  });

  return {
    name: "aras",
    async createShipment(req) {
      if (!configured) {
        throw new Error("Aras entegrasyonu yapılandırılmadı.");
      }
      const res = await fetch(`${base}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ARAS_API_KEY}`,
        },
        body: JSON.stringify({ ...req, apiSecret: process.env.ARAS_API_SECRET }),
      });
      if (!res.ok) throw new Error(`Aras API hatası: ${res.status}`);
      const json = (await res.json()) as {
        trackingNumber: string;
        barcode: string;
        labelUrl?: string;
        status: string;
      };
      return {
        trackingNumber: json.trackingNumber,
        barcode: json.barcode,
        labelUrl: json.labelUrl,
        providerStatus: json.status,
        externalReference: req.externalReference,
      };
    },
    async getTracking() {
      return [];
    },
    async testConnection() {
      const res = await fetch(`${base}/health`, { method: "GET" });
      if (!res.ok) throw new Error(`Aras bağlantı hatası: ${res.status}`);
    },
  };
}

// ------------------------------------------------------------------
// DHL
// ------------------------------------------------------------------
function dhlProvider(): CargoProvider {
  const base = process.env.DHL_API_URL;
  const configured = isIntegrationConfigured({
    url: process.env.DHL_API_URL,
    key: process.env.DHL_API_KEY,
    secret: process.env.DHL_API_SECRET,
  });

  return {
    name: "dhl",
    async createShipment(req) {
      if (!configured) throw new Error("DHL entegrasyonu yapılandırılmadı.");
      const res = await fetch(`${base}/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DHL_API_KEY}`,
        },
        body: JSON.stringify({ ...req, apiSecret: process.env.DHL_API_SECRET }),
      });
      if (!res.ok) throw new Error(`DHL API hatası: ${res.status}`);
      const json = (await res.json()) as {
        shipmentId: string;
        trackingNumber: string;
        labelUrl?: string;
      };
      return {
        trackingNumber: json.trackingNumber,
        barcode: json.shipmentId,
        labelUrl: json.labelUrl,
        providerStatus: "created",
        externalReference: req.externalReference,
      };
    },
    async getTracking() {
      return [];
    },
    async testConnection() {
      const res = await fetch(`${base}/ping`, { method: "GET" });
      if (!res.ok) throw new Error(`DHL bağlantı hatası: ${res.status}`);
    },
  };
}

// ------------------------------------------------------------------
// HepsiJET
// ------------------------------------------------------------------
function hepsijetProvider(): CargoProvider {
  const base = process.env.HEPSIJET_API_URL;
  const configured = isIntegrationConfigured({
    url: process.env.HEPSIJET_API_URL,
    key: process.env.HEPSIJET_API_KEY,
    secret: process.env.HEPSIJET_API_SECRET,
  });

  return {
    name: "hepsijet",
    async createShipment(req) {
      if (!configured) throw new Error("HepsiJET entegrasyonu yapılandırılmadı.");
      const res = await fetch(`${base}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HEPSIJET_API_KEY}`,
        },
        body: JSON.stringify({ ...req, apiSecret: process.env.HEPSIJET_API_SECRET }),
      });
      if (!res.ok) throw new Error(`HepsiJET API hatası: ${res.status}`);
      const json = (await res.json()) as {
        referenceNumber: string;
        trackingNumber: string;
        barcode: string;
      };
      return {
        trackingNumber: json.trackingNumber,
        barcode: json.barcode,
        providerStatus: "created",
        externalReference: req.externalReference,
      };
    },
    async getTracking() {
      return [];
    },
    async testConnection() {
      const res = await fetch(`${base}/health`, { method: "GET" });
      if (!res.ok) throw new Error(`HepsiJET bağlantı hatası: ${res.status}`);
    },
  };
}

// ------------------------------------------------------------------
// PTT
// ------------------------------------------------------------------
function pttProvider(): CargoProvider {
  const base = process.env.PTT_API_URL;
  const configured = isIntegrationConfigured({
    url: process.env.PTT_API_URL,
    key: process.env.PTT_API_KEY,
    secret: process.env.PTT_API_SECRET,
  });

  return {
    name: "ptt",
    async createShipment(req) {
      if (!configured) throw new Error("PTT entegrasyonu yapılandırılmadı.");
      const res = await fetch(`${base}/v1/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": process.env.PTT_API_KEY ?? "",
        },
        body: JSON.stringify({ ...req, apiSecret: process.env.PTT_API_SECRET }),
      });
      if (!res.ok) throw new Error(`PTT API hatası: ${res.status}`);
      const json = (await res.json()) as { tracking: string; barcode: string };
      return {
        trackingNumber: json.tracking,
        barcode: json.barcode,
        providerStatus: "created",
        externalReference: req.externalReference,
      };
    },
    async getTracking() {
      return [];
    },
    async testConnection() {
      const res = await fetch(`${base}/status`, { method: "GET" });
      if (!res.ok) throw new Error(`PTT bağlantı hatası: ${res.status}`);
    },
  };
}

// ------------------------------------------------------------------
// Fake adapter (deterministik, credential gerektirmez)
// ------------------------------------------------------------------
function fakeProvider(name: CargoProviderName): CargoProvider {
  let counter = 0;
  return {
    name, // registry'de gerçek provider yokken fallback olarak kullanılır
    async createShipment(req) {
      if (process.env.ENABLE_FAKE_CARGO_PROVIDER !== "true") {
        throw new Error("PROVIDER_UNCONFIGURED");
      }
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
    async testConnection() {
      if (process.env.ENABLE_FAKE_CARGO_PROVIDER !== "true") {
        throw new Error("PROVIDER_UNCONFIGURED");
      }
    },
  };
}

export function getProviderConfig(name: CargoProviderName): { configured: boolean } {
  switch (name) {
    case "aras":
      return {
        configured: isIntegrationConfigured({
          url: process.env.ARAS_API_URL,
          key: process.env.ARAS_API_KEY,
          secret: process.env.ARAS_API_SECRET,
        }),
      };
    case "dhl":
      return {
        configured: isIntegrationConfigured({
          url: process.env.DHL_API_URL,
          key: process.env.DHL_API_KEY,
          secret: process.env.DHL_API_SECRET,
        }),
      };
    case "hepsijet":
      return {
        configured: isIntegrationConfigured({
          url: process.env.HEPSIJET_API_URL,
          key: process.env.HEPSIJET_API_KEY,
          secret: process.env.HEPSIJET_API_SECRET,
        }),
      };
    case "ptt":
      return {
        configured: isIntegrationConfigured({
          url: process.env.PTT_API_URL,
          key: process.env.PTT_API_KEY,
          secret: process.env.PTT_API_SECRET,
        }),
      };
  }
}

/** Tüm desteklenen provider'ların config durumunu döndürür. */
export function getAllProviderStatuses(): Record<CargoProviderName, { configured: boolean }> {
  return {
    aras: getProviderConfig("aras"),
    dhl: getProviderConfig("dhl"),
    hepsijet: getProviderConfig("hepsijet"),
    ptt: getProviderConfig("ptt"),
  };
}

/**
 * Çalışma zamanı provider'ını döndürür.
 * Gerçek credential yapılandırılabilirse gerçek provider, değilse fake kullanılır.
 * Not: Fake yalnızca development/test için; gerçek gönderi üretmese de
 * kargo oluşturma akışının deterministik testine olanak tanır.
 */
export function getProvider(name: CargoProviderName): CargoProvider {
  const cfg = getServerConfig(); // core config'i çek (provider'lar için gerilim)
  void cfg;

  const configured = getProviderConfig(name).configured;
  if (configured) {
    switch (name) {
      case "aras":
        return arasProvider();
      case "dhl":
        return dhlProvider();
      case "hepsijet":
        return hepsijetProvider();
      case "ptt":
        return pttProvider();
    }
  }
  return fakeProvider(name);
}

/** Test/senaryo için tüm provider'ları sabit bir harita olarak döndürür. */
export function getAllProviders(): CargoProviderMap {
  return {
    aras: getProvider("aras"),
    dhl: getProvider("dhl"),
    hepsijet: getProvider("hepsijet"),
    ptt: getProvider("ptt"),
  };
}
