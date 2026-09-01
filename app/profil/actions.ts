"use server";

import { requireStaff } from "@/lib/guard";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAvatar(avatarUrl: string | null) {
  const session = await requireStaff();
  const db = getDb();

  await db.update(users).set({ avatarUrl }).where(eq(users.id, session.userId));

  revalidatePath("/profil");
  revalidatePath("/yonetim");
  return { success: true };
}
