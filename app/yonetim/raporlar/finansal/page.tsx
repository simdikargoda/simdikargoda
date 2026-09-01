import { requireStaff } from "@/lib/guard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { getRevenueReport } from "@/lib/services/reports/reports.service";

export const dynamic = "force-dynamic";

/**
 * Finansal raporlar: gerçek satış/maliyet/kâr snapshot verisi üzerinden
 * durum bazlı özet. Kârlılık persist edilmiş değerlerden hesaplanır.
 */
export default async function FinansalRaporlarPage() {
  await requireStaff();
  const revenue = await getRevenueReport();

  const totalSale = revenue.reduce((s, r) => s + r.saleKurus, 0);
  const totalCost = revenue.reduce((s, r) => s + r.costKurus, 0);
  const totalProfit = revenue.reduce((s, r) => s + r.profitKurus, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finansal Raporlar"
        description="Satış, maliyet ve kârlılık özeti (snapshot bazlı, tarih aralığı filtresi opsiyonel)"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Satış" value={formatKurus(totalSale)} />
        <StatCard label="Toplam Maliyet" value={formatKurus(totalCost)} />
        <StatCard label="Net Kâr" value={formatKurus(totalProfit)} />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Durum Bazlı Gelir Tablosu
        </div>
        {revenue.length === 0 ? (
          <EmptyState title="Veri yok" description="Henüz finansal kayıt bulunmuyor." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium text-right">Gönderi</th>
                  <th className="px-4 py-3 font-medium text-right">Satış</th>
                  <th className="px-4 py-3 font-medium text-right">Maliyet</th>
                  <th className="px-4 py-3 font-medium text-right">Kâr</th>
                  <th className="px-4 py-3 font-medium text-right">Marj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {revenue.map((r) => (
                  <tr key={r.status} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 capitalize text-foreground">{r.status}</td>
                    <td className="px-4 py-3 text-right text-muted">{r.count}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatKurus(r.saleKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {formatKurus(r.costKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-success">
                      {formatKurus(r.profitKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {r.saleKurus > 0 ? `%${Math.round((r.profitKurus / r.saleKurus) * 100)}` : "—"}
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
