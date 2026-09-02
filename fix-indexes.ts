import { getDb } from "./db/client";
import { sql } from "drizzle-orm";

async function run() {
  const db = getDb();
  
  console.log("Creating foreign key indexes...");
  
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "balance_requests_approved_by_id_idx" ON "public"."balance_requests" ("approved_by_id");`,
    `CREATE INDEX IF NOT EXISTS "balance_requests_requested_by_user_id_idx" ON "public"."balance_requests" ("requested_by_user_id");`,
    `CREATE INDEX IF NOT EXISTS "balance_transactions_performed_by_id_idx" ON "public"."balance_transactions" ("performed_by_id");`,
    `CREATE INDEX IF NOT EXISTS "collections_collected_by_id_idx" ON "public"."collections" ("collected_by_id");`,
    `CREATE INDEX IF NOT EXISTS "current_account_transactions_performed_by_id_idx" ON "public"."current_account_transactions" ("performed_by_id");`,
    `CREATE INDEX IF NOT EXISTS "customer_users_user_id_idx" ON "public"."customer_users" ("user_id");`,
    `CREATE INDEX IF NOT EXISTS "shipments_created_by_id_idx" ON "public"."shipments" ("created_by_id");`
  ];
  
  for (const index of indexes) {
    try {
      await db.execute(sql.raw(index));
      console.log(`Created index: ${index.split('ON')[0].trim()}`);
    } catch (e: any) {
      console.log(`Error creating index: ${e.message}`);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
