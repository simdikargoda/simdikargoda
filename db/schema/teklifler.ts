import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

import { customers } from "@/db/schema/customer";
import { users } from "@/db/schema/auth";

export const teklifStatusEnum = pgEnum("teklif_status", [
  "pending",
  "approved",
  "rejected",
]);

export const teklifler = pgTable(
  "teklifler",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }), // Mevcut müşteri ise
    leadName: text("lead_name"), // Henüz müşteri değilse
    leadEmail: text("lead_email"),
    leadPhone: text("lead_phone"),
    
    title: text("title").notNull(),
    status: teklifStatusEnum("status").notNull().default("pending"),
    
    // Fiyatlandırma detayı (JSON formatında)
    pricingDetails: text("pricing_details"),
    
    notes: text("notes"),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("teklifler_customer_idx").on(table.customerId),
    index("teklifler_status_idx").on(table.status),
  ]
);
