import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireStaff } from "@/lib/guard";
import { getAuditLogs } from "@/lib/services/finance/audit.service";

export const dynamic = "force-dynamic";

/**
 * Audit logları — gerçek persiste edilmiş audit verisi. Hassas alanların
 * (secret/token/şifre/MFA secret) loglanması sistem tarafından engellenir.
 */
export default async function AuditLoglarPage({ title, description }: { title: string; description: string }) {
  await requireStaff();
  let logs = await getAuditLogs(100);



  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="overflow-hidden rounded-2xl border border-panel-secondary bg-white shadow-sm">
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <EmptyState
              title="Kayıt bulunamadı"
              description="Gösterilecek bir sistem aktivitesi bulunmuyor."
            />
          ) : (
            <table className="w-full text-left text-sm text-foreground">
              <thead className="border-b border-panel-secondary bg-panel text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tarih</th>
                  <th className="px-6 py-4 font-semibold">Aksiyon</th>
                  <th className="px-6 py-4 font-semibold">Varlık</th>
                  <th className="px-6 py-4 font-semibold">Kullanıcı ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {logs.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-panel-secondary/30">
                    <td className="px-6 py-4 text-muted">
                      {new Date(l.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-6 py-4 font-mono text-foreground">{l.action}</td>
                    <td className="px-6 py-4 text-muted">
                      {l.entityType}
                      {l.entityId ? ` #${l.entityId.slice(0, 8)}` : ""}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted">
                      {l.actorUserId ? l.actorUserId.slice(0, 8) : "—"}
                    </td>
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
