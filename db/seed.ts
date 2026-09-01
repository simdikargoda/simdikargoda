 
// Next.js'te .env.local otomatik yüklenir; standalone seed için explicit yükleriz.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { getDb } from "@/db/client";
import * as authSchema from "@/db/schema/auth";
import * as customerSchema from "@/db/schema/customer";
import * as financeSchema from "@/db/schema/finance";
import * as pricingSchema from "@/db/schema/pricing";
import { cargoProviderEnum } from "@/db/schema/shipment";

/**
 * Geliştirme ortamı için anlamlı seed verisi.
 * Production'da otomatik çalıştırılmaz; güvenli değildir.
 * PERSONEL VE MÜŞTERİ SIFRELERİ seed dosyasında açıkça yazılır — sadece dev içindir.
 */

async function seed() {
  const db = getDb();

  console.log("🌱 Seed başlıyor...");

  // ---- Yönetici kullanıcı ----
  const adminEmail = "ozan.forum@hotmail.com";
  const existingAdmin = await db.query.users.findFirst({
    where: eq(authSchema.users.email, adminEmail),
  });

  let adminId = existingAdmin?.id;
  if (!adminId) {
    const [admin] = await db
      .insert(authSchema.users)
      .values({
        email: adminEmail,
        passwordHash: bcrypt.hashSync("Ozan1234!", 10),
        name: "Ozan (Sistem Yöneticisi)",
        role: "admin",
      })
      .returning();
    adminId = admin.id;
    console.log("  ✓ Yönetici oluşturuldu:", adminEmail);
  }

  // ---- Bakiyeli müşteri ----
  const balanceCustomerEmail = "musteri@bakiyeli.test";
  let balanceCustomer = await db.query.customers.findFirst({
    where: eq(customerSchema.customers.email, balanceCustomerEmail),
  });

  if (!balanceCustomer) {
    const [cust] = await db
      .insert(customerSchema.customers)
      .values({
        name: "Bakiyeli Firma A",
        authorizedPerson: "Ahmet Yılmaz",
        phone: "0532 000 00 01",
        email: balanceCustomerEmail,
        type: "balance",
        status: "active",
        city: "İstanbul",
        district: "Kadıköy",
        address: "Caferağa Mah. Örnek Sok. No:1",
      })
      .returning();
    balanceCustomer = cust;

    await db.insert(financeSchema.balanceAccounts).values({
      customerId: cust.id,
      balanceKurus: 100_00_00, // ₺10.000
    });

    await db
      .insert(authSchema.users)
      .values({
        email: `user@bakiyeli.test`,
        passwordHash: bcrypt.hashSync("Musteri123!", 10),
        name: "Ahmet Yılmaz",
        role: "customer",
        customerId: cust.id,
      })
      .onConflictDoNothing();

    console.log("  ✓ Bakiyeli müşteri oluşturuldu:", cust.name);
  }

  // ---- Cari müşteri ----
  const currentEmail = "musteri@cari.test";
  let currentCustomer = await db.query.customers.findFirst({
    where: eq(customerSchema.customers.email, currentEmail),
  });

  if (!currentCustomer) {
    const [cust] = await db
      .insert(customerSchema.customers)
      .values({
        name: "Cari Firma B",
        authorizedPerson: "Ayşe Kaya",
        phone: "0532 000 00 02",
        email: currentEmail,
        type: "current_account",
        status: "active",
        city: "Ankara",
        district: "Çankaya",
        address: "Kızılay Mah. Örnek Cad. No:5",
      })
      .returning();
    currentCustomer = cust;

    await db.insert(financeSchema.currentAccounts).values({
      customerId: cust.id,
      debitKurus: 0,
      limitKurus: 50_00_00, // ₺50.000 limit
    });

    await db
      .insert(authSchema.users)
      .values({
        email: `user@cari.test`,
        passwordHash: bcrypt.hashSync("Musteri123!", 10),
        name: "Ayşe Kaya",
        role: "customer",
        customerId: cust.id,
      })
      .onConflictDoNothing();

    console.log("  ✓ Cari müşteri oluşturuldu:", cust.name);
  }

  // ---- Örnek fiyatlar ----
  const pricingExists = await db
    .select({ id: pricingSchema.customerCargoPrices.id })
    .from(pricingSchema.customerCargoPrices)
    .limit(1);

  if (pricingExists.length === 0 && balanceCustomer && currentCustomer) {
    const providers = cargoProviderEnum.enumValues;
    for (const provider of providers) {
      await db.insert(pricingSchema.customerCargoPrices).values({
        customerId: balanceCustomer.id,
        provider,
        type: "fixed",
        priceKurus: Math.round(100 + Math.random() * 200) * 100, // ₺100-300
        costKurus: Math.round(60 + Math.random() * 100) * 100,
        isActive: true,
        createdById: adminId,
      });
      await db.insert(pricingSchema.customerCargoPrices).values({
        customerId: currentCustomer.id,
        provider,
        type: "fixed",
        priceKurus: Math.round(100 + Math.random() * 200) * 100,
        costKurus: Math.round(60 + Math.random() * 100) * 100,
        isActive: true,
        createdById: adminId,
      });
    }
    console.log("  ✓ Örnek kargo fiyatları oluşturuldu");
  }

  console.log("🌱 Seed tamamlandı.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed hatası:", err);
  process.exit(1);
});
