import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { customers } from "@/db/schema/customer";

// ------------------------------------------------------------------
// Entegrasyon ve audit/log şeması
// ------------------------------------------------------------------

export const integrationStatusEnum = pgEnum("integration_status", [
  "active",
  "unconfigured",
  "connection_error",
  "temporary_issue",
  "disabled",
]);

/** Kargo firması + Netgsm gibi servislerin config durumunu gösterir. */
export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull().unique(), // aras | dhl | hepsijet | ptt | netgsm
    status: integrationStatusEnum("status").notNull().default("unconfigured"),
    configured: boolean().notNull().default(false),
    lastTestAt: timestamp("last_test_at", { withTimezone: true }),
    lastTestResult: jsonb("last_test_result"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("integrations_provider_idx").on(table.provider)]
);

/** Kritik yönetim işlemlerinin audit izi. */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id"),
    action: text("action").notNull(), // e.g. customer.updated, price.changed
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    raw: jsonb("raw"), // değişim özeti (hassas secret İÇERMEZ)
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_entity_idx").on(table.entityType, table.entityId),
    index("audit_customer_idx").on(table.customerId),
    index("audit_created_at_idx").on(table.createdAt),
  ]
);
