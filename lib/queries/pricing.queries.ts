import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { customerCargoPrices, priceChangeAudit } from "@/db/schema/pricing";
import { customers } from "@/db/schema/customer";

export async function getCustomPrices() {
  const db = getDb();
  return db
    .select({
      id: customerCargoPrices.id,
      customerId: customerCargoPrices.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
      provider: customerCargoPrices.provider,
      type: customerCargoPrices.type,
      priceKurus: customerCargoPrices.priceKurus,
      costKurus: customerCargoPrices.costKurus,
      breakpoint: customerCargoPrices.breakpoint,
      isActive: customerCargoPrices.isActive,
      createdAt: customerCargoPrices.createdAt,
    })
    .from(customerCargoPrices)
    .innerJoin(customers, eq(customers.id, customerCargoPrices.customerId))
    .orderBy(desc(customerCargoPrices.createdAt));
}

export async function getPriceAuditLogs() {
  const db = getDb();
  return db
    .select({
      id: priceChangeAudit.id,
      priceId: priceChangeAudit.priceId,
      customerId: priceChangeAudit.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
      provider: priceChangeAudit.provider,
      oldValueKurus: priceChangeAudit.oldValueKurus,
      newValueKurus: priceChangeAudit.newValueKurus,
      changedAt: priceChangeAudit.changedAt,
    })
    .from(priceChangeAudit)
    .innerJoin(customers, eq(customers.id, priceChangeAudit.customerId))
    .orderBy(desc(priceChangeAudit.changedAt));
}
