import "server-only";

import type { NormalizedStatus } from "@/lib/providers/cargo/contract";

/**
 * Provider durum kodları → uygulamanın ortak status modeli.
 * Farklı kargo firmalarının ham durumlarını tek bir modele eşler.
 */

// Aras olası durum bantları
const ARAS_MAP: Record<string, NormalizedStatus> = {
  "01": "in_transit",
  "02": "in_transit",
  "03": "delivered",
  "04": "pending",
  "05": "issue",
  "06": "returned",
  "07": "cancelled",
};

// DHL olası durumlar
const DHL_MAP: Record<string, NormalizedStatus> = {
  created: "created",
  pickedup: "in_transit",
  transit: "in_transit",
  delivered: "delivered",
  deposited: "delivered",
  exception: "issue",
  returned: "returned",
};

// HepsiJET olası durumlar
const HEPSIJET_MAP: Record<string, NormalizedStatus> = {
  "1": "created",
  "2": "in_transit",
  "3": "delivered",
  "4": "pending",
  "5": "issue",
  "6": "returned",
};

// PTT olası durumlar
const PTT_MAP: Record<string, NormalizedStatus> = {
  "0": "created",
  "1": "in_transit",
  "2": "pending",
  "3": "delivered",
  "4": "issue",
  "5": "returned",
  "6": "cancelled",
};

export function normalizeStatus(payload: string, provider: string): NormalizedStatus {
  const key = payload.trim().toLowerCase();
  let mapped: NormalizedStatus | undefined;

  switch (provider) {
    case "aras":
      mapped = ARAS_MAP[key];
      break;
    case "dhl":
      mapped = DHL_MAP[key];
      break;
    case "hepsijet":
      mapped = HEPSIJET_MAP[key];
      break;
    case "ptt":
      mapped = PTT_MAP[key];
      break;
  }

  if (mapped) return mapped;
  // Bilinmeyen durum: güvenli varsayılan "issue" değil, "pending"e yedekle.
  return "pending";
}
