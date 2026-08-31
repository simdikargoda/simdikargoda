import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { customers } from "@/db/schema/customer";
import { balanceAccounts, currentAccounts } from "@/db/schema/finance";

export async function getCustomers() {
  const db = getDb();
  const rows = await db
    .select({
      customer: customers,
      balanceKurus: balanceAccounts.balanceKurus,
      limitKurus: currentAccounts.limitKurus,
      debitKurus: currentAccounts.debitKurus,
    })
    .from(customers)
    .leftJoin(balanceAccounts, eq(balanceAccounts.customerId, customers.id))
    .leftJoin(currentAccounts, eq(currentAccounts.customerId, customers.id))
    .orderBy(customers.createdAt);

  return rows.map((r) => r.customer);
}

/** Müşteri listesi için sorgu verilerini döndürür (id + ad + durum + tip). */
export async function getCustomerOptions() {
  const db = getDb();
  const rows = await db
    .select({ id: customers.id, name: customers.name, type: customers.type })
    .from(customers)
    .where(eq(customers.status, "active"))
    .orderBy(customers.name);
  return rows;
}
