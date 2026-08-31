import "server-only";

import { isIntegrationConfigured } from "@/lib/config";
import { cargoProviderEnum } from "@/db/schema/shipment";

/**
 * Ortak kargo provider contract'ı.
 *
 * Tüm kargo firmaları (Aras, DHL, HepsiJET, PTT) bu arayüzün arkasında
 * implemente edilir; domain katmanı provider'a özgü detaya doğrudan
 * bağımlı olmaz. Provider response'ları normalize edilir ve dış API
 * değişiklikleri UI'ı kırmaz.
 */

export type CargoProviderName = (typeof cargoProviderEnum.enumValues)[number];

export interface ShipmentRequest {
  externalReference: string; // idempotency referansı
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity?: string;
  senderDistrict?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity?: string;
  receiverDistrict?: string;
  packageCount: number;
  desi: number;
  weight: number;
  description?: string;
}

export interface ShipmentResponse {
  trackingNumber: string;
  barcode: string;
  labelUrl?: string;
  /** Provider'ın orta düzey durum kodu (normalize edilecek). */
  providerStatus: string;
  /** Provider'a özgü referans çekirdeği. */
  externalReference: string;
}

export interface TrackingEvent {
  providerStatus: string;
  /** Uygulamanın ortak durum modeline eşlenmiş normal durum. */
  normalizedStatus: NormalizedStatus;
  occurredAt: Date;
  description?: string;
}

export type NormalizedStatus =
  | "created"
  | "in_transit"
  | "delivered"
  | "pending"
  | "issue"
  | "returned"
  | "cancelled";

/** Kargo firması provider'ı. */
export interface CargoProvider {
  readonly name: CargoProviderName;
  /** Created shipment. Provider unique tracking/barcode üretir. */
  createShipment(request: ShipmentRequest): Promise<ShipmentResponse>;
  /** Takip sorgulama — webhook yoksa polling için. */
  getTracking(trackingNumber: string): Promise<TrackingEvent[]>;
  /** Temel bağlantı testi ("Bağlantıyı Test Et"). */
  testConnection(): Promise<void>;
}

export type CargoProviderMap = Record<CargoProviderName, CargoProvider>;
