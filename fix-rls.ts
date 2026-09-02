import { getDb } from "./db/client";
import { sql } from "drizzle-orm";

async function run() {
  const db = getDb();
  
  console.log("Enabling RLS on all tables in public schema...");
  
  // Get all tables in public schema
  const res = await db.execute(sql`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public';
  `);
  
  for (const row of res.rows) {
    const tableName = row.tablename;
    console.log(`Enabling RLS on ${tableName}...`);
    // Using raw string concatenation here is safe because tablename comes from pg_catalog
    await db.execute(sql.raw(`ALTER TABLE "public"."${tableName}" ENABLE ROW LEVEL SECURITY;`));
  }
  
  console.log("Fixing storage bucket policy...");
  // Drop the broad SELECT policy on storage.objects for the avatars bucket if it exists
  // The policy name is "Allow public reads"
  try {
    await db.execute(sql`
      DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
    `);
    console.log("Dropped 'Allow public reads' policy on storage.objects");
  } catch (err) {
    console.log("Could not drop policy, might not have permissions or it might not exist.", err);
  }
  
  console.log("Done!");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
