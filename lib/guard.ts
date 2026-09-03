import "server-only";

import { AppError } from "@/lib/errors";
import { getCurrentSession, type SessionPayload } from "@/lib/auth";

import { redirect } from "next/navigation";

/**
 * Middleware benzeri yardımcılar.
 * NOT: Buradaki rol kontrolü yalnızca UX/güzergah için hızlı bir eşik;
 * gerçek güvenlik her server action / route handler içinde tekrarlanır.
 */

export type AuthContext = SessionPayload;

export async function requireAuth(): Promise<AuthContext> {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/giris");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthContext> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    redirect("/giris");
  }
  return session;
}

/** Yönetici veya operasyon personeli gerektiren işlemler. Deprecated: Use requireAdmin instead. */
export const requireStaff = requireAdmin;



/**
 * Tenant/customer isolation: Aksi durumda membership + object-level
 * auth burada yapılamaz; hertürlü kayıt işlemi kendi sorgusunda
 * `customerId` filtrelemesi yapar. Bu yardımcı yalnızca müşterinin
 * kendi customerId'sine erişim sağlar.
 */
export function assertCustomerScope(customerId: string, session: AuthContext): void {
  if (session.role === "admin") {
    return; // personel istediği müşteri üzerinde çalışabilir
  }
  if (session.customerId !== customerId) {
    throw new AppError(
      "FORBIDDEN",
      "Bu müşteri kaydına erişim yetkiniz bulunmuyor.",
      403
    );
  }
}
