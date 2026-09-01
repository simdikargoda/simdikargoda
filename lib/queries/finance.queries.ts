import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  balanceAccounts,
  balanceTransactions,
  currentAccountTransactions,
  currentAccounts,
} from "@/db/schema/finance";
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

/** Bir müşterinin tüm bakiye hareketlerini listeler. */
export async function getBalanceTransactionsForCustomer(customerId: string) {
  const db = getDb();
  return db.query.balanceTransactions.findMany({
    where: eq(balanceTransactions.customerId, customerId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}

/** Tüm bakiye hareketleri (personel görünümü). */
export async function getAllBalanceTransactions(limit = 100) {
  const db = getDb();
  return db.query.balanceTransactions.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

/** Bekleyen ve tüm bakiye yükleme talepleri. */
export async function getAllBalanceRequests(limit = 100) {
  const db = getDb();
  return db.query.balanceRequests.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

/** Bir müşterinin cari hareketlerini listeler. */
export async function getCurrentAccountTransactionsForCustomer(customerId: string) {
  const db = getDb();
  return db.query.currentAccountTransactions.findMany({
    where: eq(currentAccountTransactions.customerId, customerId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}

/** Tüm cari hareketler (personel görünümü). */
export async function getAllCurrentAccountTransactions(limit = 100) {
  const db = getDb();
  return db.query.currentAccountTransactions.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

/** Tüm tahsilat kayıtları. */
export async function getAllCollections(limit = 100) {
  const db = getDb();
  return db.query.collections.findMany({
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
  });
}

/**
 * Kritik bakiye: bakiyesi 0 veya negative olan hesaplar ile kullanılabilir
 * limiti tükenen cari hesaplar. Eşik değerleri domain'den türetilir.
 */
export async function getCriticalBalanceAccounts(thresholdKurus = 0) {
  const db = getDb();

  const low = await db
    .select({
      id: balanceAccounts.id,
      customerId: balanceAccounts.customerId,
      balanceKurus: balanceAccounts.balanceKurus,
      customerName: customers.name,
    })
    .from(balanceAccounts)
    .innerJoin(customers, eq(customers.id, balanceAccounts.customerId))
    .where(sql`${balanceAccounts.balanceKurus} <= ${thresholdKurus}`)
    .orderBy(asc(balanceAccounts.balanceKurus));

  // Cari: kullanılabilir limit = limit - borç; eşiğin altında olanlar kritik.
  const criticalCari = await db
    .select({
      id: currentAccounts.id,
      customerId: currentAccounts.customerId,
      debitKurus: currentAccounts.debitKurus,
      limitKurus: currentAccounts.limitKurus,
      customerName: customers.name,
    })
    .from(currentAccounts)
    .innerJoin(customers, eq(customers.id, currentAccounts.customerId))
    .where(
      sql`(${currentAccounts.limitKurus} - ${currentAccounts.debitKurus}) <= ${thresholdKurus}`
    )
    .orderBy(sql`(${currentAccounts.limitKurus} - ${currentAccounts.debitKurus})`);

  return { low, criticalCari };
}
