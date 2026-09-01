import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { AppError } from "@/lib/errors";
import { customerCargoPrices, priceChangeAudit } from "@/db/schema/pricing";
import { customers } from "@/db/schema/customer";
import { writeAuditLog, type DbTx } from "@/lib/services/finance/audit.service";

export type CargoProvider = "aras" | "dhl" | "hepsijet" | "ptt";
export type PricingType = "fixed" | "per_weight" | "per_desi";

export interface ResolvePriceInput {
  customerId: string;
  provider: CargoProvider;
  weight: number;
  desi: number;
}

export interface ResolvedPrice {
  salePriceKurus: number;
  costPriceKurus: number;
  priceId: string;
}

/**
 * Fiyatlandırma servisi.
 *
 * Fiyatlar yalnızca backend'de çözümlenir; frontend'den gelen fiyata
 * asla güvenilmez. Kargo oluşturulurken üretilen snapshot, tarifenin
 * sonradan değişmesi durumunda bile geçmiş finansal gerçeği korur.
 */
export async function setCustomerPrice(input: {
  customerId: string;
  provider: CargoProvider;
  type: PricingType;
  priceKurus: number;
  costKurus?: number;
  breakpoint?: number;
  activatedById?: string;
}): Promise<void> {
  if (!Number.isInteger(input.priceKurus) || input.priceKurus < 0) {
    throw new AppError("VALIDATION_ERROR", "Geçersiz fiyat tutarı.", 400);
  }
  if (
    (input.type === "per_weight" || input.type === "per_desi") &&
    (!Number.isInteger(input.breakpoint) || !input.breakpoint || input.breakpoint <= 0)
  ) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Birim bazlı fiyatlarda ağırlık/desi eşiği (breakpoint) pozitif olmalıdır.",
      400
    );
  }

  const db = getDb();
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, input.customerId),
  });
  if (!customer) {
    throw new AppError("NOT_FOUND", "Müşteri bulunamadı.", 404);
  }

  await db.transaction(async (tx) => {
    const txRef = tx as unknown as DbTx;

    // Aynı müşteri+provider için mevcut aktif fiyatı pasife al (tek aktif).
    await tx
      .update(customerCargoPrices)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(customerCargoPrices.customerId, input.customerId),
          eq(customerCargoPrices.provider, input.provider),
          eq(customerCargoPrices.isActive, true)
        )
      );

    const [price] = await tx
      .insert(customerCargoPrices)
      .values({
        customerId: input.customerId,
        provider: input.provider,
        type: input.type,
        priceKurus: input.priceKurus,
        costKurus: input.costKurus ?? 0,
        breakpoint: input.breakpoint ?? null,
        isActive: true,
        createdById: input.activatedById,
      })
      .returning();

    await tx.insert(priceChangeAudit).values({
      priceId: price.id,
      customerId: input.customerId,
      provider: input.provider,
      oldValueKurus: null,
      newValueKurus: input.priceKurus,
      changedById: input.activatedById,
    });

    await writeAuditLog({
      actorUserId: input.activatedById,
      action: "price.created",
      entityType: "customer_cargo_price",
      entityId: price.id,
      customerId: input.customerId,
      meta: { provider: input.provider, type: input.type, priceKurus: input.priceKurus },
      tx: txRef,
    });
  });
}

/**
 * Müşteri + provider için geçerli satış/maliyet fiyatını çözer.
 * Uygulanan tutar kuruş cinsinden döner; kargo oluşturmada snapshot olarak kullanılır.
 */
export async function resolvePrice(input: ResolvePriceInput): Promise<ResolvedPrice> {
  const db = getDb();

  const [price] = await db
    .select()
    .from(customerCargoPrices)
    .where(
      and(
        eq(customerCargoPrices.customerId, input.customerId),
        eq(customerCargoPrices.provider, input.provider),
        eq(customerCargoPrices.isActive, true)
      )
    )
    .limit(1);

  if (!price) {
    throw new AppError(
      "PRICE_NOT_FOUND",
      `Bu müşteri için ${input.provider} kargo fiyatı tanımlanmamış.`,
      400
    );
  }

  const unit =
    price.type === "per_weight" ? input.weight : price.type === "per_desi" ? input.desi : null;

  let salePriceKurus = price.priceKurus;
  let costPriceKurus = price.costKurus;

  if (unit !== null) {
    const factor = Math.max(1, Math.ceil(unit / (price.breakpoint || 1)));
    salePriceKurus = price.priceKurus * factor;
    costPriceKurus = price.costKurus * factor;
  }

  return { salePriceKurus, costPriceKurus, priceId: price.id };
}

/** Müşterinin tüm (aktif) kargo fiyatlarını listeler. */
export async function listCustomerPrices(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.customerCargoPrices.findMany({
    where: and(
      eq(customerCargoPrices.customerId, customerId),
      eq(customerCargoPrices.isActive, true)
    ),
    orderBy: (t, { asc }) => [asc(t.provider)],
  });
}

/** Belirli bir müşterinin belirli provider fiyat geçmişini (audit) listeler. */
export async function listPriceChangeHistory(customerId: string) {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  return db.query.priceChangeAudit.findMany({
    where: eq(priceChangeAudit.customerId, customerId),
    orderBy: (t, { desc }) => [desc(t.changedAt)],
  });
}

/** Tüm fiyatları müşteri adlarıyla birlikte listeler. */
export async function listAllPrices() {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const rows = await db
    .select()
    .from(customerCargoPrices)
    .leftJoin(customers, eq(customers.id, customerCargoPrices.customerId))
    .orderBy(customerCargoPrices.createdAt);
  return rows.map((r) => ({
    ...r.customer_cargo_prices,
    customerName: r.customers?.name ?? null,
  }));
}

/** Tüm fiyat değişim geçmişini müşteri adlarıyla birlikte listeler. */
export async function listAllPriceHistory() {
  const { getDb } = await import("@/db/client");
  const db = getDb();
  const rows = await db
    .select()
    .from(priceChangeAudit)
    .leftJoin(customers, eq(customers.id, priceChangeAudit.customerId))
    .orderBy(priceChangeAudit.changedAt);
  return rows.map((r) => ({
    ...r.price_change_audit,
    customerName: r.customers?.name ?? null,
  }));
}

/** Fiyatlandırma genel görünümü için özet veriler. */
export async function getPricingOverview() {
  const prices = await listAllPrices();
  const history = await listAllPriceHistory();
  return { prices, history };
}
