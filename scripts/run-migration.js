import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

async function runMigration() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:54322/postgres"
  });

  try {
    await client.connect();
    console.log("Connected to DB!");
    
    const sql = fs.readFileSync('db/migrations/0001_fearless_tinkerer.sql', 'utf8');
    await client.query(sql);
    console.log("Migration executed successfully!");
    
  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

runMigration();
