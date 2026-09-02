import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { apiKeys, webhooks, integrations } from "@/db/schema/integration";
import { customers } from "@/db/schema/customer";

export async function getApiKeys() {
  const db = getDb();
  return db
    .select({
      id: apiKeys.id,
      customerId: apiKeys.customerId,
      customerName: customers.name,
      name: apiKeys.name,
      key: apiKeys.key,
      lastUsedAt: apiKeys.lastUsedAt,
      isActive: apiKeys.isActive,
      createdAt: apiKeys.createdAt,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .innerJoin(customers, eq(customers.id, apiKeys.customerId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function getWebhooks() {
  const db = getDb();
  return db
    .select({
      id: webhooks.id,
      customerId: webhooks.customerId,
      customerName: customers.name,
      url: webhooks.url,
      isActive: webhooks.isActive,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .leftJoin(customers, eq(customers.id, webhooks.customerId))
    .orderBy(desc(webhooks.createdAt));
}

export async function getIntegrations() {
  const db = getDb();
  return db
    .select({
      id: integrations.id,
      provider: integrations.provider,
      status: integrations.status,
      configured: integrations.configured,
      lastTestAt: integrations.lastTestAt,
      lastTestResult: integrations.lastTestResult,
      note: integrations.note,
    })
    .from(integrations)
    .orderBy(integrations.provider);
}
