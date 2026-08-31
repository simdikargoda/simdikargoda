"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/guard";
import { revokeSession, revokeAllOtherSessions, logSecurityEvent, getCurrentSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";

export async function revokeSessionAction(sessionId: string) {
  try {
    const session = await requireAuth();
    await revokeSession(sessionId, session.userId);
    
    await logSecurityEvent(session.userId, "SESSION_REVOKED");
    revalidatePath("/profil/oturumlar");
    
    return { success: "Oturum başarıyla sonlandırıldı." };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function revokeOtherSessionsAction() {
  try {
    const sessionPayload = await getCurrentSession();
    if (!sessionPayload) throw new Error("Oturum bulunamadı");
    
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) throw new Error("Geçerli oturum anahtarı bulunamadı.");

    // Mevcut session hash'ini bulmalıyız
    const crypto = await import("crypto");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // tokenHash ile mevcut sessions tablosundaki ID'yi bulmak için ek db query yazmıyoruz, auth.ts içindeki revokeAllOtherSessions'ı kullanıyoruz
    // auth.ts'i tokenHash tabanlı çalışacak şekilde genişletmeliyiz.
    
    const { getDb } = await import("@/db/client");
    const { sessions } = await import("@/db/schema/auth");
    const { eq } = await import("drizzle-orm");
    const db = getDb();
    
    const currentSession = await db.query.sessions.findFirst({
      where: eq(sessions.tokenHash, tokenHash)
    });
    
    if (currentSession) {
      await revokeAllOtherSessions(sessionPayload.userId, currentSession.id);
      await logSecurityEvent(sessionPayload.userId, "OTHER_SESSIONS_REVOKED");
      revalidatePath("/profil/oturumlar");
      return { success: "Diğer tüm oturumlarınız kapatıldı." };
    }
    
    throw new Error("Mevcut oturum belirlenemedi.");
  } catch (err: any) {
    return { error: err.message };
  }
}
