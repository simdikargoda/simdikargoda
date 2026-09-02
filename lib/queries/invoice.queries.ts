import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { invoices } from "@/db/schema/finance";
import { customers } from "@/db/schema/customer";

export async function getInvoices() {
  const db = getDb();
  return db
    .select({
      id: invoices.id,
      customerId: invoices.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
      invoiceNo: invoices.invoiceNo,
      totalKurus: invoices.totalKurus,
      taxKurus: invoices.taxKurus,
      status: invoices.status,
      dueDate: invoices.dueDate,
      issuedAt: invoices.issuedAt,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .innerJoin(customers, eq(customers.id, invoices.customerId))
    .orderBy(desc(invoices.createdAt));
}
