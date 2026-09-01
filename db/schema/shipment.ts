import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { customers } from "@/db/schema/customer";
import { users } from "@/db/schema/auth";

// ------------------------------------------------------------------
// Kargo (gönderi) domain şeması
// ------------------------------------------------------------------

export const cargoProviderEnum = pgEnum("cargo_provider", [
  "aras",
  "dhl",
  "hepsijet",
  "ptt",
]);

/**
 * Ortak (normalize) gönderi durumu. Provider'a özgü raw durumlar
 * bu modele map edilir. Kullanıcı deneyiminde bu sınıflandırma korunur.
 */
export const shipmentStatusEnum = pgEnum("shipment_status", [
  "created", // kayıt oluşturuldu, henüz yola çıkmadı
  "in_transit", // yolda / çıkan
  "delivered", // teslim edildi
  "pending", // bekleyen
  "issue", // sorunlu
  "returned", // iade
  "cancelled", // iptal
]);

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    provider: cargoProviderEnum("provider").notNull(),
    trackingNumber: text("tracking_number"),
    barcode: text("barcode"),
    status: shipmentStatusEnum("status").notNull().default("created"),

    // Fiyat snapshot'ı — günümüz tarifesi değişse de geçmiş gerçek korunur.
    salePriceKurus: integer("sale_price_kurus").notNull().default(0),
    costPriceKurus: integer("cost_price_kurus").notNull().default(0),

    idempotencyKey: text("idempotency_key"),
    externalReference: text("external_reference"), // provider referansı

    // Gönderici
    senderName: text("sender_name").notNull(),
    senderPhone: text("sender_phone").notNull(),
    senderAddress: text("sender_address").notNull(),
    senderCity: text("sender_city"),
    senderDistrict: text("sender_district"),

    // Alıcı
    receiverName: text("receiver_name").notNull(),
    receiverPhone: text("receiver_phone").notNull(),
    receiverAddress: text("receiver_address").notNull(),
    receiverCity: text("receiver_city"),
    receiverDistrict: text("receiver_district"),

    // Paket
    packageCount: integer("package_count").notNull().default(1),
    desi: integer("desi").notNull().default(1),
    weight: integer("weight").notNull().default(1),
    description: text("description"),

    labelUrl: text("label_url"),

    lastProviderEventAt: timestamp("last_provider_event_at", { withTimezone: true }),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("shipments_idempotency_key_idx").on(table.idempotencyKey),
    index("shipments_customer_date_idx").on(table.customerId, table.createdAt),
    index("shipments_tracking_idx").on(table.trackingNumber),
    index("shipments_barcode_idx").on(table.barcode),
    index("shipments_status_idx").on(table.status),
    index("shipments_provider_idx").on(table.provider),
  ]
);

export const shipmentStatusHistory = pgTable(
  "shipment_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shipmentId: uuid("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    fromStatus: shipmentStatusEnum("from_status"),
    toStatus: shipmentStatusEnum("to_status").notNull(),
    providerStatus: text("provider_status"), // provider'ın orijinal durum kodu
    source: text("source"), // webhook | polling | manual | system
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("shipment_history_shipment_date_idx").on(table.shipmentId, table.createdAt),
  ]
);
