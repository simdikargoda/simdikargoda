import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { customers } from "@/db/schema/customer";
import { cargoProviderEnum } from "@/db/schema/shipment";

// ------------------------------------------------------------------
// Fiyatlandırma: müşteri + kargo firması bazlı fiyat tarifeleri
// Fiyatlar kuruş hassasiyetli integer'dır.
// ------------------------------------------------------------------

export const pricingTypeEnum = pgEnum("pricing_type", ["fixed", "per_weight", "per_desi"]);

export const customerCargoPrices = pgTable(
  "customer_cargo_prices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    provider: cargoProviderEnum("provider").notNull(),
    type: pricingTypeEnum("type").notNull().default("fixed"),
    /** fixed: tek tutar. per_weight/per_desi: birim başına tutar. */
    priceKurus: integer("price_kurus").notNull().default(0),
    /** fixed tipte geçersiz; per_* tiplerde birim eşiği için kullanılabilir. */
    breakpoint: integer("breakpoint"),
    /** Aynı müşteri+provider için tek aktif fiyat. */
    isActive: boolean("is_active").notNull().default(true),
    // Gelecekte maliyet bilgisi ayrı tutulmak istenirse:
    costKurus: integer("cost_kurus").notNull().default(0),
    createdById: uuid("created_by_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("customer_prices_customer_provider_idx").on(table.customerId, table.provider),
    index("customer_prices_active_idx").on(table.isActive),
  ]
);

/**
 * Fiyat değişikliklerinin audit izi. Eski değer ile yeni değer
 * birlikte saklanır.
 */
export const priceChangeAudit = pgTable(
  "price_change_audit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    priceId: uuid("price_id").references(() => customerCargoPrices.id, {
      onDelete: "set null",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    provider: cargoProviderEnum("provider").notNull(),
    oldValueKurus: integer("old_value_kurus"),
    newValueKurus: integer("new_value_kurus"),
    changedById: uuid("changed_by_id"),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("price_audit_customer_idx").on(table.customerId),
    index("price_audit_price_idx").on(table.priceId),
  ]
);
