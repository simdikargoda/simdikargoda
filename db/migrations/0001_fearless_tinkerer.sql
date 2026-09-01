CREATE TABLE "security_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "security_audit_logs" ADD CONSTRAINT "security_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "security_audit_logs_user_id_idx" ON "security_audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "security_audit_logs_action_idx" ON "security_audit_logs" USING btree ("action");