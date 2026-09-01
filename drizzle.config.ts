import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig } from "drizzle-kit";

import type { Config } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/*.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Local ortam: Supabase docker (port 54332, "postgres" db). Production'da DATABASE_URL tanımlanır.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54332/postgres",
  },
  strict: true,
  verbose: true,
}) satisfies Config;
