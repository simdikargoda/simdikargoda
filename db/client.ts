import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as authSchema from "@/db/schema/auth";
import * as customerSchema from "@/db/schema/customer";
import * as financeSchema from "@/db/schema/finance";
import * as pricingSchema from "@/db/schema/pricing";
import * as shipmentSchema from "@/db/schema/shipment";
import * as notificationSchema from "@/db/schema/notification";
import * as integrationSchema from "@/db/schema/integration";

const schema = {
  ...authSchema,
  ...customerSchema,
  ...financeSchema,
  ...pricingSchema,
  ...shipmentSchema,
  ...notificationSchema,
  ...integrationSchema,
};

export type Database = NodePgDatabase<typeof schema>;

declare global {
   
  var __dbPool: Pool | undefined;
   
  var __db: Database | undefined;
}

function createPool(): Pool {
  const config: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX) || 10,
  };

  // Serverless (Vercel) ortamında bağlantı stratejisi.
  if (process.env.VERCEL_ENV === "production" && process.env.DATABASE_URL) {
    config.max = 1;
  }

  const pool = new Pool(config);
  return pool;
}

function createDb(): Database {
  const pool = global.__dbPool ?? createPool();
  global.__dbPool = pool;

  const db = drizzle(pool, { schema });
  global.__db = db;
  return db;
}

/**
 * Development ortamında serverless hot-reload sırasında
 * connection pool şişmesini önlemek için global cache kullanılır.
 */
export function getDb(): Database {
  if (process.env.NODE_ENV === "production") {
    return createDb();
  }
  if (!global.__db) {
    global.__db = createDb();
  }
  return global.__db;
}
