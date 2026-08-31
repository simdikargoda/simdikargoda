import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/db/schema/auth";
import { customers } from "@/db/schema/customer";

// ------------------------------------------------------------------
// Bildirim (SMS) şeması — Netgsm
// ------------------------------------------------------------------

export const smsStatusEnum = pgEnum("sms_status", [
  "pending",
  "sent",
  "failed",
  "delivered",
]);

export const smsMessages = pgTable(
  "sms_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    toPhone: text("to_phone").notNull(),
    content: text("content").notNull(),
    status: smsStatusEnum("status").notNull().default("pending"),
    eventType: text("event_type"), // shipment_created | shipment_status | delivered | problem | balance ...
    providerMessageId: text("provider_message_id"),
    errorMessage: text("error_message"),
    retryCount: text("retry_count").notNull().default("0"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("sms_customer_status_idx").on(table.customerId, table.status),
    index("sms_created_at_idx").on(table.createdAt),
  ]
);
