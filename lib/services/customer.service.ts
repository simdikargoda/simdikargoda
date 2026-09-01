import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { AppError } from "@/lib/errors";
import {
  balanceAccounts,
  currentAccounts,
} from "@/db/schema/finance";
import { customers } from "@/db/schema/customer";

export type CustomerType = "balance" | "current_account";

export interface CreateCustomerInput {
  name: string;
  authorizedPerson?: string;
  phone: string;
  email: string;
  taxOffice?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  type: CustomerType;
  /** Yönetici yeni bakiye/cari hesaba tanımlayacağı başlangıç değerleri. */
  initialBalanceKurus?: number;
  initialLimitKurus?: number;
}

export interface CustomerWithAccounts {
  customer: typeof customers.$inferSelect;
  balanceKurus: number;
  debitKurus: number;
  limitKurus: number;
}

/**
 * Müşteri oluşturur ve çalışma modeline (bakiye/cari) göre
 * ilgili finans hesabını aynı anda açar. Email benzersizliği
 * DB düzeyinde unique constraint ile korunur.
 */
export async function createCustomer(input: CreateCustomerInput) {
  const db = getDb();

  // Email çakışmasını ancak kullanıcı dostu hata için ön kontrol et
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, input.email),
  });
  if (existing) {
    throw new AppError("CONFLICT", "Bu e-posta ile kayıtlı bir müşteri bulunuyor.", 409);
  }

  const result = await db.transaction(async (tx) => {
    const [customer] = await tx
      .insert(customers)
      .values({
        name: input.name,
        authorizedPerson: input.authorizedPerson,
        phone: input.phone,
        email: input.email,
        taxOffice: input.taxOffice,
        taxNumber: input.taxNumber,
        address: input.address,
        city: input.city,
        district: input.district,
        type: input.type,
      })
      .returning();

    if (customer.type === "balance") {
      await tx.insert(balanceAccounts).values({
        customerId: customer.id,
        balanceKurus: input.initialBalanceKurus ?? 0,
      });
    } else {
      await tx.insert(currentAccounts).values({
        customerId: customer.id,
        debitKurus: 0,
        limitKurus: input.initialLimitKurus ?? 0,
      });
    }

    return customer;
  });

  return result;
}

/** Müşteri + finans hesap özetini döndürür. */
export async function getCustomerWithAccounts(
  customerId: string
): Promise<CustomerWithAccounts> {
  const db = getDb();
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, customerId),
  });
  if (!customer) {
    throw new AppError("NOT_FOUND", "Müşteri bulunamadı.", 404);
  }

  let balanceKurus = 0;
  let debitKurus = 0;
  let limitKurus = 0;

  if (customer.type === "balance") {
    const acc = await db.query.balanceAccounts.findFirst({
      where: eq(balanceAccounts.customerId, customerId),
    });
    balanceKurus = acc?.balanceKurus ?? 0;
  } else {
    const acc = await db.query.currentAccounts.findFirst({
      where: eq(currentAccounts.customerId, customerId),
    });
    debitKurus = acc?.debitKurus ?? 0;
    limitKurus = acc?.limitKurus ?? 0;
  }

  return { customer, balanceKurus, debitKurus, limitKurus };
}

/** Müşteri aktif/pasif durumunu günceller. */
export async function setCustomerStatus(
  customerId: string,
  status: "active" | "passive"
) {
  const db = getDb();
  const result = await db
    .update(customers)
    .set({ status, updatedAt: new Date() })
    .where(eq(customers.id, customerId))
    .returning();

  if (result.length === 0) {
    throw new AppError("NOT_FOUND", "Müşteri bulunamadı.", 404);
  }
  return result[0];
}

export interface UpdateCustomerInput {
  customerId: string;
  name: string;
  authorizedPerson?: string;
  phone: string;
  email: string;
  taxOffice?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  status: "active" | "passive";
}

/** Müşteri bilgilerini günceller. */
export async function updateCustomer(input: UpdateCustomerInput) {
  const db = getDb();

  // Kendi email'i hariç çakışma var mı kontrol et
  const existing = await db.query.customers.findFirst({
    where: eq(customers.email, input.email),
  });

  if (existing && existing.id !== input.customerId) {
    throw new AppError("CONFLICT", "Bu e-posta ile kayıtlı başka bir müşteri bulunuyor.", 409);
  }

  const result = await db
    .update(customers)
    .set({
      name: input.name,
      authorizedPerson: input.authorizedPerson,
      phone: input.phone,
      email: input.email,
      taxOffice: input.taxOffice,
      taxNumber: input.taxNumber,
      address: input.address,
      city: input.city,
      district: input.district,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, input.customerId))
    .returning();

  if (result.length === 0) {
    throw new AppError("NOT_FOUND", "Müşteri bulunamadı.", 404);
  }

  return result[0];
}

/** 
 * Müşteriyi siler. 
 * Kurumsal sistemlerde (ERP/Lojistik) finansal veya operasyonel (kargo) verisi
 * olan müşteri hard-delete yapılamaz. Verisi varsa hata döner (pasife alınması önerilir).
 */
export async function deleteCustomer(customerId: string) {
  const db = getDb();
  
  // 1. Kargo kaydı var mı kontrolü
  const { shipments } = await import("@/db/schema/shipment");
  const hasShipment = await db.query.shipments.findFirst({
    where: eq(shipments.customerId, customerId),
  });

  if (hasShipment) {
    throw new AppError(
      "CONFLICT", 
      "Bu müşteriye ait kargo kayıtları veya finansal hareketler bulunmaktadır. Veri bütünlüğünü korumak adına müşteriyi silemezsiniz, ancak durumunu 'Pasif'e çekebilirsiniz.", 
      409
    );
  }

  // İşlemleri Transaction içinde yapalım
  await db.transaction(async (tx) => {
    // 2. Bakiyeli müşteri ise bakiye hesabını sil
    await tx.delete(balanceAccounts).where(eq(balanceAccounts.customerId, customerId));
    
    // 3. Cari müşteri ise cari hesabı sil
    await tx.delete(currentAccounts).where(eq(currentAccounts.customerId, customerId));
    
    // 4. Müşteriyi sil
    const deleted = await tx.delete(customers).where(eq(customers.id, customerId)).returning();
    
    if (deleted.length === 0) {
      throw new AppError("NOT_FOUND", "Müşteri bulunamadı.", 404);
    }
  });

  return true;
}
