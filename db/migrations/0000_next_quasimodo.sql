CREATE TYPE "public"."user_role" AS ENUM('admin', 'operation', 'customer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'passive');--> statement-breakpoint
CREATE TYPE "public"."customer_status" AS ENUM('active', 'passive');--> statement-breakpoint
CREATE TYPE "public"."customer_type" AS ENUM('balance', 'current_account');--> statement-breakpoint
CREATE TYPE "public"."balance_transaction_type" AS ENUM('deposit', 'shipment_fee', 'refund', 'adjustment', 'admin_credit', 'cancel');--> statement-breakpoint
CREATE TYPE "public"."collection_status" AS ENUM('received', 'void');--> statement-breakpoint
CREATE TYPE "public"."current_account_transaction_type" AS ENUM('shipment_debit', 'collection', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."pricing_type" AS ENUM('fixed', 'per_weight', 'per_desi');--> statement-breakpoint
CREATE TYPE "public"."cargo_provider" AS ENUM('aras', 'dhl', 'hepsijet', 'ptt');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('created', 'in_transit', 'delivered', 'pending', 'issue', 'returned', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."sms_status" AS ENUM('pending', 'sent', 'failed', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('active', 'unconfigured', 'connection_error', 'temporary_issue', 'disabled');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"customer_id" uuid,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"user_agent" text,
	"ip_address" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"avatar_url" text,
	"phone" text,
	"two_factor_secret" text,
	"is_two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_recovery_codes" text,
	"customer_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"authorized_person" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"tax_office" text,
	"tax_number" text,
	"address" text,
	"city" text,
	"district" text,
	"type" "customer_type" DEFAULT 'balance' NOT NULL,
	"status" "customer_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "balance_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"balance_kurus" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "balance_accounts_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "balance_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"requested_by_user_id" uuid NOT NULL,
	"amount_kurus" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"bank_reference" text,
	"note" text,
	"approved_by_id" uuid,
	"approved_at" timestamp with time zone,
	"rejected_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "balance_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" "balance_transaction_type" NOT NULL,
	"amount_kurus" integer NOT NULL,
	"balance_before_kurus" integer NOT NULL,
	"balance_after_kurus" integer NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"description" text,
	"performed_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount_kurus" integer NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "collection_status" DEFAULT 'received' NOT NULL,
	"method" text,
	"note" text,
	"collected_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "current_account_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" "current_account_transaction_type" NOT NULL,
	"amount_kurus" integer NOT NULL,
	"debit_before_kurus" integer NOT NULL,
	"debit_after_kurus" integer NOT NULL,
	"reference_type" text,
	"reference_id" uuid,
	"description" text,
	"performed_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "current_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"debit_kurus" integer DEFAULT 0 NOT NULL,
	"limit_kurus" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "current_accounts_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "customer_cargo_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"provider" "cargo_provider" NOT NULL,
	"type" "pricing_type" DEFAULT 'fixed' NOT NULL,
	"price_kurus" integer DEFAULT 0 NOT NULL,
	"breakpoint" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"cost_kurus" integer DEFAULT 0 NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_change_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price_id" uuid,
	"customer_id" uuid,
	"provider" "cargo_provider" NOT NULL,
	"old_value_kurus" integer,
	"new_value_kurus" integer,
	"changed_by_id" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipment_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shipment_id" uuid NOT NULL,
	"from_status" "shipment_status",
	"to_status" "shipment_status" NOT NULL,
	"provider_status" text,
	"source" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"provider" "cargo_provider" NOT NULL,
	"tracking_number" text,
	"barcode" text,
	"status" "shipment_status" DEFAULT 'created' NOT NULL,
	"sale_price_kurus" integer DEFAULT 0 NOT NULL,
	"cost_price_kurus" integer DEFAULT 0 NOT NULL,
	"idempotency_key" text,
	"external_reference" text,
	"sender_name" text NOT NULL,
	"sender_phone" text NOT NULL,
	"sender_address" text NOT NULL,
	"sender_city" text,
	"sender_district" text,
	"receiver_name" text NOT NULL,
	"receiver_phone" text NOT NULL,
	"receiver_address" text NOT NULL,
	"receiver_city" text,
	"receiver_district" text,
	"package_count" integer DEFAULT 1 NOT NULL,
	"desi" integer DEFAULT 1 NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"description" text,
	"label_url" text,
	"last_provider_event_at" timestamp with time zone,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sms_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"to_phone" text NOT NULL,
	"content" text NOT NULL,
	"status" "sms_status" DEFAULT 'pending' NOT NULL,
	"event_type" text,
	"provider_message_id" text,
	"error_message" text,
	"retry_count" text DEFAULT '0' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"status" "integration_status" DEFAULT 'unconfigured' NOT NULL,
	"configured" boolean DEFAULT false NOT NULL,
	"last_test_at" timestamp with time zone,
	"last_test_result" jsonb,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integrations_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_users" ADD CONSTRAINT "customer_users_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_users" ADD CONSTRAINT "customer_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_accounts" ADD CONSTRAINT "balance_accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_requests" ADD CONSTRAINT "balance_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_requests" ADD CONSTRAINT "balance_requests_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_requests" ADD CONSTRAINT "balance_requests_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transactions" ADD CONSTRAINT "balance_transactions_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_collected_by_id_users_id_fk" FOREIGN KEY ("collected_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "current_account_transactions" ADD CONSTRAINT "current_account_transactions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "current_account_transactions" ADD CONSTRAINT "current_account_transactions_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "current_accounts" ADD CONSTRAINT "current_accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_cargo_prices" ADD CONSTRAINT "customer_cargo_prices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_change_audit" ADD CONSTRAINT "price_change_audit_price_id_customer_cargo_prices_id_fk" FOREIGN KEY ("price_id") REFERENCES "public"."customer_cargo_prices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_change_audit" ADD CONSTRAINT "price_change_audit_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipment_status_history" ADD CONSTRAINT "shipment_status_history_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_customer_idx" ON "audit_logs" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_idx" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_customer_id_idx" ON "users" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "customer_users_customer_user_idx" ON "customer_users" USING btree ("customer_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customers_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customers_type_idx" ON "customers" USING btree ("type");--> statement-breakpoint
CREATE INDEX "customers_city_idx" ON "customers" USING btree ("city");--> statement-breakpoint
CREATE INDEX "balance_accounts_customer_id_idx" ON "balance_accounts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "balance_requests_customer_status_idx" ON "balance_requests" USING btree ("customer_id","status");--> statement-breakpoint
CREATE INDEX "balance_requests_status_idx" ON "balance_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "balance_tx_customer_date_idx" ON "balance_transactions" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "balance_tx_reference_idx" ON "balance_transactions" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "balance_tx_type_idx" ON "balance_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "collections_customer_date_idx" ON "collections" USING btree ("customer_id","collected_at");--> statement-breakpoint
CREATE INDEX "collections_status_idx" ON "collections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "current_tx_customer_date_idx" ON "current_account_transactions" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "current_tx_reference_idx" ON "current_account_transactions" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "current_accounts_customer_id_idx" ON "current_accounts" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_prices_customer_provider_idx" ON "customer_cargo_prices" USING btree ("customer_id","provider");--> statement-breakpoint
CREATE INDEX "customer_prices_active_idx" ON "customer_cargo_prices" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "price_audit_customer_idx" ON "price_change_audit" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "price_audit_price_idx" ON "price_change_audit" USING btree ("price_id");--> statement-breakpoint
CREATE INDEX "shipment_history_shipment_date_idx" ON "shipment_status_history" USING btree ("shipment_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "shipments_idempotency_key_idx" ON "shipments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "shipments_customer_date_idx" ON "shipments" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "shipments_tracking_idx" ON "shipments" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "shipments_barcode_idx" ON "shipments" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "shipments_status_idx" ON "shipments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shipments_provider_idx" ON "shipments" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "sms_customer_status_idx" ON "sms_messages" USING btree ("customer_id","status");--> statement-breakpoint
CREATE INDEX "sms_created_at_idx" ON "sms_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "integrations_provider_idx" ON "integrations" USING btree ("provider");