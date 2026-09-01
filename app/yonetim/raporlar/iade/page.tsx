import { requireStaff } from "@/lib/guard";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { listShipments } from "@/lib/services/tracking/tracking.service";

export const dynamic = "force-dynamic";

/**
 * İade raporları: iade (returned) durumundaki gerçek gönderi verisi.
 * Fake satır üretilmez.
 */
export default async function IadeRaporlarPage() {
  await requireStaff();
  const shipments = await listShipments({ status: "returned", limit: 100 });

  const totalRefund = shipments.reduce((s, sh) => s + sh.salePriceKurus, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="İade Raporları"
        description="İade durumundaki gönderilerin özeti"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="text-sm font-medium text-muted">İade Gönderi Sayısı</div>
        <div className="text-right font-mono text-foreground">{shipments.length}</div>
        <div className="text-sm font-medium text-muted">İade Tutarı (Satış)</div>
        <div className="text-right font-mono text-foreground">{formatKurus(totalRefund)}</div>
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          İade Gönderileri
        </div>
        {shipments.length === 0 ? (
          <EmptyState title="İade yok" description="Henüz iade durumunda gönderi bulunmuyor." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Takip No</th>
                  <th className="px-4 py-3 font-medium">Firma</th>
                  <th className="px-4 py-3 font-medium text-right">Satış</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {shipments.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {s.trackingNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{s.provider}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatKurus(s.salePriceKurus)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(s.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
