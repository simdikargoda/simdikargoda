import { requireStaff } from "@/lib/guard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageSearch, Users } from "lucide-react";
import { formatKurus } from "@/lib/money";
import {
  getRevenueReport,
  getCustomerReport,
} from "@/lib/services/reports/reports.service";

export const dynamic = "force-dynamic";

/**
 * Gönderi raporları: gerçek DB verisi üzerinden durum bazlı satış/maliyet/kâr
 * ve müşteri bazlı dağılım. Kârlılık, kalıcı snapshot değerlerden hesaplanır.
 */
export default async function GonderiRaporlarPage() {
  await requireStaff();
  const [revenue, customers] = await Promise.all([
    getRevenueReport(),
    getCustomerReport(),
  ]);

  const totalProfit = revenue.reduce((s, r) => s + r.profitKurus, 0);
  const totalRevenue = revenue.reduce((s, r) => s + r.saleKurus, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gönderi Raporları"
        description="Durum ve müşteri bazlı gönderi, satış, maliyet ve kârlılık"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Satış" value={formatKurus(totalRevenue)} />
        <StatCard label="Toplam Kâr" value={formatKurus(totalProfit)} />
        <StatCard label="Durum Dağılımı" value={String(revenue.length)} />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Durum Bazlı Rapor
        </div>
        {revenue.length === 0 ? (
          <EmptyState icon={PackageSearch} title="Veri yok" description="Henüz gönderi kaydı bulunmuyor." />
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Müşteri Bazlı Rapor
        </div>
        {customers.length === 0 ? (
          <EmptyState icon={Users} title="Veri yok" description="Henüz müşteri gönderi kaydı bulunmuyor." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri ID</th>
                  <th className="px-4 py-3 font-medium text-right">Gönderi</th>
                  <th className="px-4 py-3 font-medium text-right">Satış</th>
                  <th className="px-4 py-3 font-medium text-right">Maliyet</th>
                  <th className="px-4 py-3 font-medium text-right">Kâr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {customers.map((c) => (
                  <tr key={c.customerId} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-mono text-muted">{c.customerId}</td>
                    <td className="px-4 py-3 text-right text-muted">{c.count}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatKurus(c.saleKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {formatKurus(c.costKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-success">
                      {formatKurus(c.profitKurus)}
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
