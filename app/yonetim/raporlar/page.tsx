import { requireStaff } from "@/lib/guard";
import { getAdminDashboardData } from "@/lib/services/reports/reports.service";
import { PageHeader } from "@/components/ui/page-header";
import { ShipmentTrendChart, RevenueTrendChart } from "@/components/widgets/dashboard-charts";
import { ProviderDonutChart } from "@/components/widgets/provider-donut-chart";
import { formatKurus } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function RaporlarPage() {
  await requireStaff();
  const data = await getAdminDashboardData();

  const providerChartData = data.byProvider.map((p) => ({
    key: p.name,
    label: p.name,
    value: p.count,
  }));

  const statusChartData = data.byStatus.map((s) => ({
    key: s.name,
    label: s.name,
    value: s.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raporlar ve Analizler"
        description="Operasyonel performans, kârlılık ve gönderi trendleri"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-6">7 Günlük Gönderi Trendi</h3>
          <ShipmentTrendChart data={data.shipmentTrend} />
        </div>

        <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-6">6 Aylık Ciro Analizi</h3>
          <RevenueTrendChart data={data.revenueTrend} />
        </div>

        <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-6">Kargo Firmalarına Göre Dağılım</h3>
          <ProviderDonutChart data={providerChartData} />
        </div>

        <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-6">Müşteri Ciro Dağılımı (Top 5)</h3>
          <div className="space-y-4">
            {data.topCustomers.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted">{c.count} Gönderi</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatKurus(c.revenueKurus)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
