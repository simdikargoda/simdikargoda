import { and, eq, sql } from "drizzle-orm";

import {
  collections,
  currentAccountTransactions,
  currentAccounts,
} from "@/db/schema/finance";
import { AppError } from "@/lib/errors";
import type { Database } from "@/db/client";

/**
 * Cari hesap (ledger) servisi.
 *
 * Tüm mutasyonlar `SELECT ... FOR UPDATE` kilidiyle transaction içinde
 * yapılır; başka dublike borç/tahsilat oluşması önlenir.
 * Cari limit kontrolü backend seviyesinde burada yapılır.
 */

export type DbTx = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type CurrentAccountTxType =
  | "shipment_debit"
  | "collection"
  | "adjustment";

interface ApplyCariDeltaInput {
  customerId: string;
  type: CurrentAccountTxType;
  /** shipment_debit: pozitif (borç artar), collection: negatif (borç azalır) */
  deltaKurus: number;
  referenceType?: "shipment" | "collection" | "adjustment";
  referenceId?: string;
  description?: string;
  performedById?: string;
  /** shipment_debit işlemlerinde limit kontrolü yapılır. */
  checkLimit?: boolean;
  tx?: DbTx;
}

async function lockCurrentAccount(customerId: string, tx: DbTx) {
  const res = await tx.execute(
    sql`SELECT debit_kurus, limit_kurus FROM current_accounts WHERE customer_id = ${customerId} FOR UPDATE`
  );
  const rows = (res as unknown as { rows: Record<string, unknown>[] }).rows;
  const first = rows[0] as
    | { debit_kurus: unknown; limit_kurus: unknown }
    | undefined;
  if (!first) {
    throw new AppError("NOT_FOUND", "Cari hesabı bulunamadı.", 404);
  }
  return {
    debitKurus: Number(first.debit_kurus),
    limitKurus: Number(first.limit_kurus),
  };
}

export async function applyCurrentAccountDelta(
  input: ApplyCariDeltaInput
): Promise<void> {
  const delta = input.deltaKurus;
  if (!Number.isInteger(delta) || delta === 0) {
    throw new AppError("VALIDATION_ERROR", "Geçersiz cari işlem tutarı.", 400);
  }

  if (!input.tx) {
    const { getDb } = await import("@/db/client");
    await getDb().transaction(async (tx) => {
      await applyCurrentAccountDelta({ ...input, tx: tx as unknown as DbTx });
    });
    return;
  }

  const tx = input.tx;
  const { debitKurus, limitKurus } = await lockCurrentAccount(input.customerId, tx);

  const newDebit = debitKurus + delta;
  if (newDebit < 0) {
    throw new AppError("VALIDATION_ERROR", "Borç tutarı 0'ın altına inemez.", 400);
  }
  if (input.checkLimit && newDebit > limitKurus) {
    throw new AppError(
      "INSUFFICIENT_LIMIT",
      "Cari limit yetersiz. İşlem tamamlanamadı.",
      400
    );
  }

  await tx
    .update(currentAccounts)
    .set({ debitKurus: newDebit, updatedAt: new Date() })
    .where(eq(currentAccounts.customerId, input.customerId));

  await tx.insert(currentAccountTransactions).values({
    customerId: input.customerId,
    type: input.type,
    amountKurus: delta,
    debitBeforeKurus: debitKurus,
    debitAfterKurus: newDebit,
    referenceType: input.referenceType,
    referenceId: input.referenceId ?? undefined,
    description: input.description,
    performedById: input.performedById,
  });
}

/** Tahsilat kaydı oluşturur (cari borcu azaltır). */
export async function recordCollection(input: {
  customerId: string;
  amountKurus: number;
  method?: string;
  note?: string;
  performedById?: string;
}): Promise<void> {
  if (!Number.isInteger(input.amountKurus) || input.amountKurus <= 0) {
    throw new AppError("VALIDATION_ERROR", "Geçersiz tahsilat tutarı.", 400);
  }

  const { getDb } = await import("@/db/client");
  const db = getDb();

  await db.transaction(async (tx) => {
    const txRef = tx as unknown as DbTx;

    // Önce tahsilat kaydı oluştur.
    const [collection] = await tx
      .insert(collections)
      .values({
        customerId: input.customerId,
        amountKurus: input.amountKurus,
        method: input.method,
        note: input.note,
        collectedById: input.performedById,
      })
      .returning();

    // Cari borcu azalt (negatif delta).
    await applyCurrentAccountDelta({
      customerId: input.customerId,
      type: "collection",
      deltaKurus: -input.amountKurus,
      referenceType: "collection",
      referenceId: collection.id,
      description: input.note ?? "Tahsilat",
      performedById: input.performedById,
      tx: txRef,
    });
  });
}

/** Cari hesap özetini döndürür. */
export async function getCurrentAccount(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.currentAccounts.findFirst({
    where: eq(currentAccounts.customerId, customerId),
  });
}

/** Kullanılabilir limit = limit - borç. */
export function availableLimit(
  account: { debitKurus: number; limitKurus: number } | undefined
): number {
  if (!account) return 0;
  return account.limitKurus - account.debitKurus;
}

/** Cari hareketleri listeler. */
export async function getCurrentAccountTransactions(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.currentAccountTransactions.findMany({
    where: and(eq(currentAccountTransactions.customerId, customerId)),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}
