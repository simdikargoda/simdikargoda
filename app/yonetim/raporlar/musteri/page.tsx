import { requireStaff } from "@/lib/guard";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { getCustomerReport } from "@/lib/services/reports/reports.service";
import { getCustomers } from "@/lib/queries/customer.queries";

export const dynamic = "force-dynamic";

/** Müşteri raporları: gerçek DB verisi üzerinden müşteri bazlı dağılım. */
export default async function MusteriRaporlarPage() {
  await requireStaff();
  const [byCustomer, customers] = await Promise.all([
    getCustomerReport(),
    getCustomers(),
  ]);
  const nameMap = new Map(customers.map((c) => [c.id, c.name]));
  const rows = byCustomer
    .map((r) => ({ customerId: r.customerId, name: nameMap.get(r.customerId) ?? "—", count: r.count, saleKurus: r.saleKurus, costKurus: r.costKurus, profitKurus: r.profitKurus }))
    .sort((a, b) => b.saleKurus - a.saleKurus);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Müşteri Raporları"
        description="Müşteri bazlı gönderi, satış ve kârlılık"
      />

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Müşteri Performansı
        </div>
        {rows.length === 0 ? (
          <EmptyState title="Veri yok" description="Henüz müşteri gönderi kaydı bulunmuyor." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium text-right">Gönderi</th>
                  <th className="px-4 py-3 font-medium text-right">Satış</th>
                  <th className="px-4 py-3 font-medium text-right">Maliyet</th>
                  <th className="px-4 py-3 font-medium text-right">Kâr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {rows.map((r) => (
                  <tr key={r.customerId} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
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
    </div>
  );
}
