import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";

// ------------------------------------------------------------------
// Müşteri (tenant) şeması
// ------------------------------------------------------------------

export const customerTypeEnum = pgEnum("customer_type", ["balance", "current_account"]);

export const customerStatusEnum = pgEnum("customer_status", ["active", "passive"]);

/**
 * Bir tüzel müşteri kaydıdır. Hem "bakiye" hem "cari" çalışma modeli
 * için tek tablo kullanılır; `type` alanıyla ayrılır.
 */
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    authorizedPerson: text("authorized_person"),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    taxOffice: text("tax_office"),
    taxNumber: text("tax_number"),
    address: text("address"),
    city: text("city"),
    district: text("district"),
    type: customerTypeEnum("type").notNull().default("balance"),
    status: customerStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customers_email_idx").on(table.email),
    index("customers_status_idx").on(table.status),
    index("customers_type_idx").on(table.type),
    index("customers_city_idx").on(table.city),
  ]
);

/**
 * Müşteriye atanan yönetici/operasyon kullanıcıları.
 * Level yalnızca admin/operation kullanıcılarını müşteriye
 * bağlamak için kullanılır.
 */
export const customerUsers = pgTable(
  "customer_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("customer_users_customer_user_idx").on(table.customerId, table.userId),
  ]
);
