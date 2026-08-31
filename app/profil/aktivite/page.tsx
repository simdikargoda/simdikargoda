import { requireAuth } from "@/lib/guard";
import { getDb } from "@/db/client";
import { securityAuditLogs } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { ShieldAlert, Key, MonitorSmartphone, ShieldCheck, ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const actionMap: Record<string, { label: string; icon: any; color: string }> = {
  PASSWORD_CHANGED: { label: "Şifre değiştirildi", icon: Key, color: "text-warning bg-warning/20" },
  MFA_ENABLED: { label: "İki aşamalı doğrulama etkinleştirildi", icon: ShieldCheck, color: "text-success bg-success/20" },
  MFA_DISABLED: { label: "İki aşamalı doğrulama devre dışı bırakıldı", icon: ShieldAlert, color: "text-danger bg-danger/20" },
  SESSION_REVOKED: { label: "Oturum sonlandırıldı", icon: MonitorSmartphone, color: "text-muted bg-panel-secondary/50" },
  OTHER_SESSIONS_REVOKED: { label: "Diğer tüm oturumlar sonlandırıldı", icon: MonitorSmartphone, color: "text-muted bg-panel-secondary/50" },
};

export default async function ActivityPage() {
  const sessionPayload = await requireAuth();

  const db = getDb();
  
  // Kullanıcının en son 50 güvenlik olayını getir
  const logs = await db.query.securityAuditLogs.findMany({
    where: eq(securityAuditLogs.userId, sessionPayload.userId),
    orderBy: [desc(securityAuditLogs.createdAt)],
    limit: 50,
  });

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
              Güvenlik Aktivitesi
            </h1>
            <p className="text-panel-secondary/80 text-sm">
              Hesabınızla ilgili son 50 güvenlik hareketini, girişleri ve oturum değişikliklerini inceleyin.
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Log Kaydı</p>
              <p className="text-sm font-semibold text-white">{logs.length} İşlem</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
          {logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-panel-secondary p-12 text-center flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-panel-secondary/50 text-muted mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-foreground">Henüz kayıtlı bir güvenlik aktivitesi yok.</p>
              <p className="text-xs text-muted mt-2">Sisteme yeni giriş yaptığınızda veya ayarlarınızı değiştirdiğinizde burada listelenecektir.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-panel-secondary before:to-transparent">
              {logs.map(log => {
                const config = actionMap[log.action] || { label: log.action, icon: ShieldCheck, color: "text-muted bg-panel-secondary/50" };
                const Icon = config.icon;
                
                return (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                      <div className={`flex h-full w-full items-center justify-center rounded-full ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-panel-secondary bg-white shadow-sm transition hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-foreground">{config.label}</h4>
                        <span className="text-[10px] font-semibold text-muted bg-panel-secondary/50 px-2 py-0.5 rounded-full">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                      </div>
                      <div className="text-xs text-muted space-y-1">
                        {log.ipAddress && <p><span className="font-medium text-foreground">IP:</span> {log.ipAddress}</p>}
                        {log.userAgent && <p className="line-clamp-2"><span className="font-medium text-foreground">Cihaz:</span> {log.userAgent}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
