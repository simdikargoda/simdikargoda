import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log("Connected to DB!");
    
    const sql = fs.readFileSync('db/migrations/0004_confused_roughhouse.sql', 'utf8');
    await client.query(sql);
    console.log("Migration 0004 executed successfully!");
    
  } catch (err) {
    console.error("Error executing migration:", err);
  } finally {
    await client.end();
  }
}

runMigration();
