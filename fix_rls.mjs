import pg from 'pg';
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { Client } = pg;

async function main() {
  // Use the direct URL to run DDL/RLS commands (avoids connection pooler issues with some DDLs)
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
  });

  await client.connect();
  console.log("Connected to DB.");

  try {
    // 1. Allow public inserts to the avatars bucket
    await client.query(`
      CREATE POLICY "Allow public inserts" ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'avatars');
    `);
    console.log("Created INSERT policy.");
  } catch (err) {
    console.log("INSERT policy might already exist:", err.message);
  }

  try {
    // 2. Allow public updates to the avatars bucket
    await client.query(`
      CREATE POLICY "Allow public updates" ON storage.objects
        FOR UPDATE
        USING (bucket_id = 'avatars');
    `);
    console.log("Created UPDATE policy.");
  } catch (err) {
    console.log("UPDATE policy might already exist:", err.message);
  }
  
  try {
    // 3. Allow public deletes to the avatars bucket
    await client.query(`
      CREATE POLICY "Allow public deletes" ON storage.objects
        FOR DELETE
        USING (bucket_id = 'avatars');
    `);
    console.log("Created DELETE policy.");
  } catch (err) {
    console.log("DELETE policy might already exist:", err.message);
  }
  
  try {
    // 4. Allow public selects (just in case bucket public setting isn't enough for object lookup)
    await client.query(`
      CREATE POLICY "Allow public reads" ON storage.objects
        FOR SELECT
        USING (bucket_id = 'avatars');
    `);
    console.log("Created SELECT policy.");
  } catch (err) {
    console.log("SELECT policy might already exist:", err.message);
  }

  await client.end();
  console.log("Done.");
}

main().catch(console.error);
