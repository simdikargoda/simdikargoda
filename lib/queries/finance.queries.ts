import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { balanceAccounts, currentAccounts } from "@/db/schema/finance";
import { customers } from "@/db/schema/customer";

export async function getBalanceAccounts() {
  const db = getDb();
  
  const accounts = await db
    .select({
      id: balanceAccounts.id,
      customerId: balanceAccounts.customerId,
      balanceKurus: balanceAccounts.balanceKurus,
      updatedAt: balanceAccounts.updatedAt,
      customerName: customers.name,
      customerEmail: customers.email,
      customerStatus: customers.status,
    })
    .from(balanceAccounts)
    .innerJoin(customers, eq(customers.id, balanceAccounts.customerId))
    .orderBy(desc(balanceAccounts.balanceKurus));

  return accounts;
}

export async function getCurrentAccounts() {
  const db = getDb();

  const accounts = await db
    .select({
      id: currentAccounts.id,
      customerId: currentAccounts.customerId,
      debitKurus: currentAccounts.debitKurus,
      limitKurus: currentAccounts.limitKurus,
      updatedAt: currentAccounts.updatedAt,
      customerName: customers.name,
      customerEmail: customers.email,
      customerStatus: customers.status,
    })
    .from(currentAccounts)
    .innerJoin(customers, eq(customers.id, currentAccounts.customerId))
    .orderBy(desc(currentAccounts.debitKurus));

  return accounts;
}
