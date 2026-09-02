import {
  index,
  integer,
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
// Finans: Bakiye (ledger) + Cari hesap + Tahsilat + Faturalar
// ------------------------------------------------------------------

export const balanceTransactionTypeEnum = pgEnum("balance_transaction_type", [
  "deposit",
  "shipment_fee",
  "refund",
  "adjustment",
  "admin_credit",
  "cancel",
]);

export const balanceAccounts = pgTable(
  "balance_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" })
      .unique(),
    balanceKurus: integer("balance_kurus").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("balance_accounts_customer_id_idx").on(table.customerId)]
);

export const balanceTransactions = pgTable(
  "balance_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    type: balanceTransactionTypeEnum("type").notNull(),
    amountKurus: integer("amount_kurus").notNull(),
    balanceBeforeKurus: integer("balance_before_kurus").notNull(),
    balanceAfterKurus: integer("balance_after_kurus").notNull(),
    referenceType: text("reference_type"),
    referenceId: uuid("reference_id"),
    description: text("description"),
    performedById: uuid("performed_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("balance_tx_customer_date_idx").on(table.customerId, table.createdAt),
    index("balance_tx_reference_idx").on(table.referenceType, table.referenceId),
    index("balance_tx_type_idx").on(table.type),
  ]
);

export const balanceRequests = pgTable(
  "balance_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    requestedByUserId: uuid("requested_by_user_id")
      .notNull()
      .references(() => users.id),
    amountKurus: integer("amount_kurus").notNull().default(0),
    status: text("status").notNull().default("pending"),
    bankReference: text("bank_reference"),
    note: text("note"),
    approvedById: uuid("approved_by_id").references(() => users.id),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedReason: text("rejected_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("balance_requests_customer_status_idx").on(table.customerId, table.status),
    index("balance_requests_status_idx").on(table.status),
  ]
);

export const currentAccountTransactionTypeEnum = pgEnum("current_account_transaction_type", [
  "shipment_debit",
  "collection",
  "adjustment",
]);

export const currentAccounts = pgTable(
  "current_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" })
      .unique(),
    debitKurus: integer("debit_kurus").notNull().default(0),
    limitKurus: integer("limit_kurus").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("current_accounts_customer_id_idx").on(table.customerId)]
);

export const currentAccountTransactions = pgTable(
  "current_account_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    type: currentAccountTransactionTypeEnum("type").notNull(),
    amountKurus: integer("amount_kurus").notNull(),
    debitBeforeKurus: integer("debit_before_kurus").notNull(),
    debitAfterKurus: integer("debit_after_kurus").notNull(),
    referenceType: text("reference_type"),
    referenceId: uuid("reference_id"),
    description: text("description"),
    performedById: uuid("performed_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("current_tx_customer_date_idx").on(table.customerId, table.createdAt),
    index("current_tx_reference_idx").on(table.referenceType, table.referenceId),
  ]
);

export const collectionStatusEnum = pgEnum("collection_status", ["received", "void"]);

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    amountKurus: integer("amount_kurus").notNull(),
    collectedAt: timestamp("collected_at", { withTimezone: true }).notNull().defaultNow(),
    status: collectionStatusEnum("status").notNull().default("received"),
    method: text("method"),
    note: text("note"),
    collectedById: uuid("collected_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("collections_customer_date_idx").on(table.customerId, table.collectedAt),
    index("collections_status_idx").on(table.status),
  ]
);

export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "issued", "paid", "cancelled"]);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    invoiceNo: text("invoice_no").unique(), // Fatura kesilince verilir
    totalKurus: integer("total_kurus").notNull(),
    taxKurus: integer("tax_kurus").notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    issuedAt: timestamp("issued_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("invoices_customer_date_idx").on(table.customerId, table.createdAt),
    index("invoices_status_idx").on(table.status),
  ]
);
