import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// ------------------------------------------------------------------
// Kimlik doğrulama ve yetkilendirme (RBAC) şeması
// ------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", ["admin", "customer"]);

export const userStatusEnum = pgEnum("user_status", ["active", "passive"]);

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  }
);

/** Rol bazlı yetki kontrolünü merkezi yapan kayıt. */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull().default("customer"),
    status: userStatusEnum("status").notNull().default("active"),
    
    // Profil bilgileri
    avatarUrl: text("avatar_url"),
    phone: text("phone"),

    // 2FA (İki Aşamalı Doğrulama) bilgileri
    twoFactorSecret: text("two_factor_secret"),
    isTwoFactorEnabled: boolean("is_two_factor_enabled").notNull().default(false),
    twoFactorRecoveryCodes: text("two_factor_recovery_codes"),

    // customer rolündeki kullanıcının bağlı olduğu müşteri (tenant)
    customerId: uuid("customer_id"),

    // admin rolündeki kullanıcının bağlı olduğu departman
    departmentId: uuid("department_id").references(() => departments.id, { onDelete: "set null" }),
    
    // Brute-force koruması
    failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_customer_id_idx").on(table.customerId),
    index("users_department_id_idx").on(table.departmentId),
    index("users_role_idx").on(table.role),
  ]
);

/** JWT-based oturum kayıtları. */
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_idx").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ]
);

/** Sistem/Güvenlik işlem logları */
export const securityAuditLogs = pgTable(
  "security_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("security_audit_logs_user_id_idx").on(table.userId),
    index("security_audit_logs_action_idx").on(table.action),
  ]
);
