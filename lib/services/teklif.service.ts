import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { teklifler } from "@/db/schema/teklifler";
import { AppError } from "@/lib/errors";

export interface CreateTeklifInput {
  customerId?: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  title: string;
  pricingDetails?: string;
  notes?: string;
  validUntil?: Date;
  createdById?: string;
}

export async function createTeklif(input: CreateTeklifInput) {
  const db = getDb();
  
  if (!input.customerId && !input.leadName) {
    throw new AppError("VALIDATION_ERROR", "Müşteri veya potansiyel müşteri adı zorunludur.", 400);
  }

  const result = await db.insert(teklifler).values({
    customerId: input.customerId ?? null,
    leadName: input.leadName ?? null,
    leadEmail: input.leadEmail ?? null,
    leadPhone: input.leadPhone ?? null,
    title: input.title,
    pricingDetails: input.pricingDetails ?? null,
    notes: input.notes ?? null,
    validUntil: input.validUntil ?? null,
    createdById: input.createdById ?? null,
  }).returning();

  return result[0];
}

export async function getTeklifler(status?: "pending" | "approved" | "rejected") {
  const db = getDb();
  
  const query = db.select().from(teklifler).orderBy(desc(teklifler.createdAt));
  
  if (status) {
    query.where(eq(teklifler.status, status));
  }
  
  return query;
}

export async function updateTeklifStatus(id: string, status: "pending" | "approved" | "rejected") {
  const db = getDb();
  
  const result = await db.update(teklifler)
    .set({ status, updatedAt: new Date() })
    .where(eq(teklifler.id, id))
    .returning();
    
  if (result.length === 0) {
    throw new AppError("NOT_FOUND", "Teklif bulunamadı.", 404);
  }
  
  return result[0];
}
