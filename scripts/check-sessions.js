import pg from 'pg';

const { Client } = pg;

async function checkSessions() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  });

  try {
    await client.connect();
    
    // Check if sessions table exists
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sessions'
      );
    `);
    
    if (res.rows[0].exists) {
      console.log("Sessions table EXISTS.");
    } else {
      console.log("Sessions table DOES NOT EXIST. Creating it...");
      await client.query(`
        CREATE TABLE IF NOT EXISTS "sessions" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL,
          "token_hash" text NOT NULL,
          "user_agent" text,
          "ip_address" text,
          "expires_at" timestamp with time zone NOT NULL,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        );
      `);
      await client.query(`
        DO $$ BEGIN
        ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        EXCEPTION
        WHEN duplicate_object THEN null;
        END $$;
      `);
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_hash_idx" ON "sessions" USING btree ("token_hash");`);
      await client.query(`CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions" USING btree ("user_id");`);
      await client.query(`CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");`);
      console.log("Sessions table created!");
    }
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkSessions();
