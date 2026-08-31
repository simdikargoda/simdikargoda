"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireStaff } from "@/lib/guard";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { revalidatePath } from "next/cache";

const updateUserRoleSchema = z.object({
  userId: z.string().uuid("Geçersiz kullanıcı ID'si."),
  role: z.enum(["admin", "customer"], {
    errorMap: () => ({ message: "Geçersiz rol." }),
  }),
});

export type UpdateUserRoleState = {
  error?: string;
  success?: boolean;
};

export async function updateUserRoleAction(
  _prev: UpdateUserRoleState,
  formData: FormData
): Promise<UpdateUserRoleState> {
  const session = await requireStaff();

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veriler." };
  }

  // Güvenlik: Admin kendi rolünü müşteri yapamasın (yanlışlıkla sistem dışı kalmamak için)
  if (parsed.data.userId === session.userId && parsed.data.role !== "admin") {
    return { error: "Kendi hesabınızın yetkisini düşüremezsiniz." };
  }

  try {
    const db = getDb();
    await db
      .update(users)
      .set({ role: parsed.data.role })
      .where(eq(users.id, parsed.data.userId));

    revalidatePath("/yonetim/roller");
    revalidatePath("/yonetim/roller/atama");
    revalidatePath("/yonetim/kullanicilar");

    return { success: true };
  } catch (err) {
    console.error("Rol güncellenirken hata:", err);
    return { error: "Rol güncellenirken bir hata oluştu." };
  }
}
