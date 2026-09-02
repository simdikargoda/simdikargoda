import "server-only";

import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { departments } from "@/db/schema/auth";

export async function getDepartments() {
  const db = getDb();
  return db
    .select()
    .from(departments)
    .orderBy(desc(departments.createdAt));
}
