"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/guard";
import { eq } from "drizzle-orm";

const newUserSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  role: z.enum(["admin", "customer"]),
});

export type NewUserState = {
  error?: string;
  success?: boolean;
};

export async function createUserAction(
  _prev: NewUserState,
  formData: FormData
): Promise<NewUserState> {
  await requireAdmin(); // Only admins can create users
  
  const parsed = newUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Geçersiz form verisi" };
  }

  const { name, email, password, role } = parsed.data;

  try {
    const db = getDb();
    
    // Check if user exists
    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
      return { error: "Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role,
      status: "active",
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Kullanıcı oluşturulurken bir hata oluştu." };
  }
}
