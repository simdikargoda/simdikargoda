"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { users, sessions } from "@/db/schema/auth";
import { requireAuth } from "@/lib/guard";
import { AppError } from "@/lib/errors";
import { logSecurityEvent, clearSessionCookie } from "@/lib/auth";
import { generateTwoFactorSecret, verifyTwoFactorCode, encryptSecret, decryptSecret } from "@/lib/2fa";

// ---- Şifre Değiştirme ----

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre zorunludur."),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır."),
});

export async function changePasswordAction(_prev: any, formData: FormData) {
  try {
    const session = await requireAuth();
    
    const parsed = passwordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message };
    }

    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
    if (!user) throw new AppError("NOT_FOUND", "Kullanıcı bulunamadı.", 404);

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return { error: "Mevcut şifreniz hatalı." };
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));

    // Diğer tüm oturumları (ve mevcut oturumu) kapat
    await db.delete(sessions).where(eq(sessions.userId, user.id));
    await clearSessionCookie();

    // Audit Log
    await logSecurityEvent(user.id, "PASSWORD_CHANGED");

    return { success: "Şifreniz başarıyla değiştirildi. Lütfen tekrar giriş yapın." };
  } catch (err: any) {
    return { error: err.message || "Bilinmeyen bir hata oluştu." };
  }
}

// ---- 2FA Kurulum ----

export async function setupTwoFactorAction() {
  const session = await requireAuth();
  const db = getDb();
  
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) throw new Error("User not found");

  // Eğer zaten aktifse yeni secret üretme
  if (user.isTwoFactorEnabled) {
    return { error: "İki aşamalı doğrulama zaten aktif." };
  }

  const secret = generateTwoFactorSecret();
  
  // Secret'ı veritabanına kaydet (henüz enabled false)
  await db.update(users).set({ twoFactorSecret: encryptSecret(secret) }).where(eq(users.id, user.id));

  return { secret };
}

export async function verifyAndEnableTwoFactorAction(_prev: any, formData: FormData) {
  try {
    const session = await requireAuth();
    const code = formData.get("code") as string;
    
    if (!code || code.length !== 6) {
      return { error: "Geçersiz doğrulama kodu." };
    }

    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
    
    if (!user || !user.twoFactorSecret) {
      return { error: "2FA kurulumu başlatılmamış." };
    }

    const isValid = verifyTwoFactorCode(code, decryptSecret(user.twoFactorSecret));
    if (!isValid) {
      return { error: "Hatalı kod girdiniz." };
    }

    await db.update(users).set({ isTwoFactorEnabled: true }).where(eq(users.id, user.id));
    
    // Audit Log
    await logSecurityEvent(user.id, "MFA_ENABLED");

    revalidatePath("/profil/guvenlik");
    return { success: "İki aşamalı doğrulama başarıyla etkinleştirildi." };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function disableTwoFactorAction(_prev: any, formData: FormData) {
  try {
    const session = await requireAuth();
    const password = formData.get("password") as string;

    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: "Şifreniz hatalı." };
    }

    await db.update(users).set({ isTwoFactorEnabled: false, twoFactorSecret: null }).where(eq(users.id, user.id));

    // Audit Log
    await logSecurityEvent(user.id, "MFA_DISABLED");

    revalidatePath("/profil/guvenlik");
    return { success: "İki aşamalı doğrulama devre dışı bırakıldı." };
  } catch (err: any) {
    return { error: err.message };
  }
}
