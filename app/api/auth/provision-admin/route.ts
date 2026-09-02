import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/guard";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { createCustomer } from "@/lib/services/customer.service";
import { createSession, setSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAuth();

  if (session.role === "admin" && !session.customerId) {
    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });

    if (user && !user.customerId) {
      // Müşteri oluştur
      const customer = await createCustomer({
        name: user.name,
        type: "balance",
        phone: "05000000000", // Varsayılan telefon
        email: user.email,
      });

      // Kullanıcıyı güncelle
      await db.update(users).set({ customerId: customer.id }).where(eq(users.id, user.id));

      // Yeni session oluştur (customerId dahil)
      const headersList = await headers();
      const userAgent = headersList.get("user-agent") ?? undefined;
      const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";
      
      const token = await createSession(user.id, userAgent, ipAddress);
      await setSessionCookie(token, true); // Admin için session'ı yenile
    }
  }

  redirect("/panel");
}
