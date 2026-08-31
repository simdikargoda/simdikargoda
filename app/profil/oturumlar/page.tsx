import { requireAuth } from "@/lib/guard";
import { getDb } from "@/db/client";
import { sessions } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth";
import crypto from "crypto";
import { SessionsList } from "./sessions-list";
import Link from "next/link";
import { ArrowLeft, MonitorSmartphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessionPayload = await requireAuth();

  const db = getDb();
  
  // Kullanıcının tüm oturumlarını getir
  const userSessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, sessionPayload.userId),
    orderBy: [desc(sessions.createdAt)],
  });

  // Mevcut oturumun ID'sini bul
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  let currentSessionId = null;
  
  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const current = userSessions.find(s => s.tokenHash === tokenHash);
    if (current) {
      currentSessionId = current.id;
    }
  }

  // Güvenlik gereği tokenHash değerlerini client'a GÖNDERMEMELİYİZ!
  const safeSessions = userSessions.map(s => ({
    id: s.id,
    userId: s.userId,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
  }));

  return (
    <div className="space-y-6 fade-in-up pb-12">
      {/* Üst Koyu Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0A101D] px-8 py-10 shadow-2xl">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <Link href="/profil" className="inline-flex items-center gap-1.5 text-primary font-bold tracking-wider text-xs uppercase hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Hesap Merkezine Dön
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Aktif Oturumlar
            </h1>
            <p className="text-panel-secondary/80 text-sm">
              Hesabınıza bağlı olan tüm cihazları ve oturumları yönetin. Tanımadığınız cihazlardan çıkış yapabilirsiniz.
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Bağlı Cihazlar</p>
              <p className="text-sm font-semibold text-white">{safeSessions.length} Oturum</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
          <SessionsList sessions={safeSessions} currentSessionId={currentSessionId} />
        </div>
      </div>
    </div>
  );
}
