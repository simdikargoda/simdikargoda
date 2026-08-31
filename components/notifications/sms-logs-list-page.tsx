import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { listSmsMessages } from "@/lib/services/notifications/sms-log.service";

export const dynamic = "force-dynamic";

/** SMS gönderim logları — gerçek DB verisi. */
export default async function SmsLogsListPage({ title, description }: { title: string; description: string }) {
  const logs = await listSmsMessages(100);

  const sent = logs.filter((l) => l.status === "sent" || l.status === "delivered").length;
  const failed = logs.filter((l) => l.status === "failed").length;

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Toplam SMS" value={String(logs.length)} />
        <StatCard label="Gönderilen" value={String(sent)} />
        <StatCard label="Başarısız" value={String(failed)} />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <EmptyState
              title="SMS logu bulunamadı"
              description="Sistem üzerinden henüz bir SMS gönderimi yapılmamış."
            />
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Tarih</th>
                  <th className="px-4 py-3 font-medium">Alıcı</th>
                  <th className="px-4 py-3 font-medium">İçerik</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Sağlayıcı ID</th>
                  <th className="px-4 py-3 font-medium">Hata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {logs.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 text-muted">
                      {l.createdAt
                        ? new Date(l.createdAt).toLocaleString("tr-TR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{l.toPhone}</td>
                    <td className="px-4 py-3 text-muted max-w-[16rem] truncate">{l.content}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          l.status === "failed"
                            ? "inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger"
                            : "inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                        }
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">{l.providerMessageId ?? "—"}</td>
                    <td className="px-4 py-3 text-danger max-w-[16rem] truncate">{l.errorMessage ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
