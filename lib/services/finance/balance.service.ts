import { and, eq, sql } from "drizzle-orm";

import { balanceAccounts, balanceTransactions } from "@/db/schema/finance";
import { AppError } from "@/lib/errors";
import type { Database } from "@/db/client";

/**
 * Bakiye (ledger) servisi.
 *
 * Concurrency güvenliği: Satır, transaction içinde `SELECT ... FOR UPDATE`
 * ile kilitlenir; aynı hesaba aynı anda gelen istekler seri hale gelir,
 * böylece çift düşüm/çift ekleme önlenir.
 *
 * Kargo oluşturma vb. çok adımlı işlemlerde çağıran taraf kendi
 * transaction'ını geçirerek atomicity'i sağlar.
 */

// Drizzle'ın transaction callback parametre tipini laçka biçimde çözümlüyoruz.
export type DbTx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type BalanceTransactionType =
  | "deposit"
  | "shipment_fee"
  | "refund"
  | "adjustment"
  | "admin_credit"
  | "cancel";

export interface ApplyDeltaInput {
  customerId: string;
  type: BalanceTransactionType;
  /** pozitif giriş, negatif çıkış (kuruş) */
  deltaKurus: number;
  referenceType?: "shipment" | "deposit" | "adjustment" | "cancel";
  referenceId?: string;
  description?: string;
  performedById?: string;
  tx?: DbTx;
}

async function lockBalance(customerId: string, tx: DbTx): Promise<number> {
  const res = await tx.execute(
    sql`SELECT balance_kurus FROM balance_accounts WHERE customer_id = ${customerId} FOR UPDATE`
  );
  // pg QueryResult: res.rows üzerinden erişilir.
  const rows = (res as unknown as { rows: Record<string, unknown>[] }).rows;
  const first = rows[0] as { balance_kurus: unknown } | undefined;
  if (!first) {
    throw new AppError("NOT_FOUND", "Bakiye hesabı bulunamadı.", 404);
  }
  return Number(first.balance_kurus);
}

export async function applyBalanceDelta(input: ApplyDeltaInput): Promise<void> {
  const delta = input.deltaKurus;
  if (!Number.isInteger(delta) || delta === 0) {
    throw new AppError("VALIDATION_ERROR", "Geçersiz bakiye işlemi tutarı.", 400);
  }

  // Transaction dışı çağrılıyorsa kendi transaction'ını başlat.
  if (!input.tx) {
    const { getDb } = await import("@/db/client");
    await getDb().transaction(async (tx) => {
      await applyBalanceDelta({ ...input, tx: tx as unknown as DbTx });
    });
    return;
  }

  const tx = input.tx;
  const before = await lockBalance(input.customerId, tx);

  const after = before + delta;
  if (after < 0) {
    throw new AppError("INSUFFICIENT_BALANCE", "Bakiye yetersiz.", 400);
  }

  await tx
    .update(balanceAccounts)
    .set({ balanceKurus: after, updatedAt: new Date() })
    .where(eq(balanceAccounts.customerId, input.customerId));

  await tx.insert(balanceTransactions).values({
    customerId: input.customerId,
    type: input.type,
    amountKurus: delta,
    balanceBeforeKurus: before,
    balanceAfterKurus: after,
    referenceType: input.referenceType,
    referenceId: input.referenceId ?? undefined,
    description: input.description,
    performedById: input.performedById,
  });
}

/** Müşterinin mevcut bakiyesini döndürür. */
export async function getBalance(customerId: string): Promise<number> {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const acc = await db.query.balanceAccounts.findFirst({
    where: eq(balanceAccounts.customerId, customerId),
  });
  return acc?.balanceKurus ?? 0;
}

/** Müşterinin bakiye hareketlerini listeler. */
export async function getBalanceTransactions(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.balanceTransactions.findMany({
    where: and(eq(balanceTransactions.customerId, customerId)),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}
