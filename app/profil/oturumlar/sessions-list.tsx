"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { MonitorSmartphone, ShieldAlert, LogOut, Loader2 } from "lucide-react";
import { revokeSessionAction, revokeOtherSessionsAction } from "./actions";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export function SessionsList({ sessions, currentSessionId }: { sessions: any[], currentSessionId: string | null }) {
  const [isPending, startTransition] = useTransition();

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      const res = await revokeSessionAction(id);
      if (res.success) {
        toast.success(res.success);
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleRevokeAll = () => {
    if (confirm("Diğer tüm oturumları kapatmak istediğinize emin misiniz? Sadece bulunduğunuz cihazdaki oturumunuz açık kalacaktır.")) {
      startTransition(async () => {
        const res = await revokeOtherSessionsAction();
        if (res.success) {
          toast.success(res.success);
        } else {
          toast.error(res.error);
        }
      });
    }
  };

  const otherSessions = sessions.filter(s => s.id !== currentSessionId);
  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Aktif Oturumlar</h3>
          <p className="mt-1 text-xs text-muted">Hesabınıza giriş yapmış cihazların listesi.</p>
        </div>
        {otherSessions.length > 0 && (
          <button 
            onClick={handleRevokeAll}
            disabled={isPending}
            className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50"
          >
            Diğer Tüm Oturumları Kapat
          </button>
        )}
      </div>

      <div className="space-y-4">
        {currentSession && (
          <div className="flex items-start gap-4 rounded-xl border border-success/30 bg-success/5 p-4 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
              <MonitorSmartphone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  {currentSession.userAgent ? currentSession.userAgent.slice(0, 40) + "..." : "Bilinmeyen Cihaz"}
                </h4>
                <span className="rounded-full bg-success/20 px-2.5 py-0.5 text-[10px] font-bold text-success uppercase">
                  Bu Cihaz
                </span>
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted">
                <span>IP: {currentSession.ipAddress || "Bilinmiyor"}</span>
                <span className="hidden sm:inline">•</span>
                <span>Oturum başlangıcı: {new Date(currentSession.createdAt).toLocaleDateString("tr-TR")}</span>
              </div>
            </div>
          </div>
        )}

        {otherSessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-panel-secondary p-8 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted/50 mb-3" />
            <h4 className="text-sm font-medium text-foreground">Başka aktif cihaz yok</h4>
            <p className="mt-1 text-xs text-muted">Hesabınız şu anda sadece bu cihazda açık.</p>
          </div>
        ) : (
          otherSessions.map(session => (
            <div key={session.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-panel-secondary bg-white p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-panel-secondary/50 text-muted">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground">
                  {session.userAgent ? session.userAgent.slice(0, 40) + "..." : "Bilinmeyen Cihaz"}
                </h4>
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[11px] text-muted">
                  <span>IP: {session.ipAddress || "Bilinmiyor"}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Oluşturuldu: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: tr })}</span>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(session.id)}
                disabled={isPending}
                className="mt-3 sm:mt-0 flex shrink-0 items-center justify-center gap-2 rounded-lg border border-panel-secondary px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-danger hover:bg-danger/10 hover:text-danger disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Oturumu Kapat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
