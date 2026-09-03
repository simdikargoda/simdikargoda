"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { users, sessions } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/guard";
import { AppError } from "@/lib/errors";

const adminPasswordSchema = z.object({
  userId: z.string().uuid(),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır."),
});

export async function adminChangePasswordAction(_prev: any, formData: FormData): Promise<{ error?: string; success?: string }> {
  try {
    await requireAdmin();
    
    const parsed = adminPasswordSchema.safeParse({
      userId: formData.get("userId"),
      newPassword: formData.get("newPassword"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message };
    }

    const db = getDb();
    const targetUser = await db.query.users.findFirst({ where: eq(users.id, parsed.data.userId) });
    if (!targetUser) throw new AppError("NOT_FOUND", "Kullanıcı bulunamadı.", 404);

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, targetUser.id));

    // Oturumları kapat
    await db.delete(sessions).where(eq(sessions.userId, targetUser.id));

    revalidatePath(`/yonetim/kullanicilar/${targetUser.id}`);
    return { success: "Kullanıcının şifresi başarıyla değiştirildi. (Eski oturumları kapatıldı)" };
  } catch (err: any) {
    return { error: err.message || "Bilinmeyen bir hata oluştu." };
  }
}

const adminNameSchema = z.object({
  userId: z.string().uuid(),
  newName: z.string().min(2, "Kullanıcı adı en az 2 karakter olmalıdır."),
});

export async function adminChangeNameAction(_prev: any, formData: FormData): Promise<{ error?: string; success?: string }> {
  try {
    await requireAdmin();
    
    const parsed = adminNameSchema.safeParse({
      userId: formData.get("userId"),
      newName: formData.get("newName"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message };
    }

    const db = getDb();
    const targetUser = await db.query.users.findFirst({ where: eq(users.id, parsed.data.userId) });
    if (!targetUser) throw new AppError("NOT_FOUND", "Kullanıcı bulunamadı.", 404);

    await db.update(users).set({ name: parsed.data.newName }).where(eq(users.id, targetUser.id));

    revalidatePath(`/yonetim/kullanicilar/${targetUser.id}`);
    return { success: "Kullanıcı adı başarıyla değiştirildi." };
  } catch (err: any) {
    return { error: err.message || "Bilinmeyen bir hata oluştu." };
  }
}

