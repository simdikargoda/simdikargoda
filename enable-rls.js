const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const tables = [
  "sessions", "customer_users", "security_audit_logs", "users",
  "balance_transactions", "collections", "current_account_transactions",
  "current_accounts", "customers", "balance_accounts", "balance_requests",
  "customer_cargo_prices", "shipments", "shipment_status_history",
  "integrations", "price_change_audit", "sms_messages", "audit_logs"
];

async function run() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();

  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
      console.log(`RLS enabled for: ${table}`);
    } catch (e) {
      console.error(`Failed to enable RLS for ${table}:`, e.message);
    }
  }

  await client.end();
  console.log("All tables secured.");
}

run().catch(console.error);
