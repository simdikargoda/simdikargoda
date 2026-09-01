import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getPricingOverview } from "@/lib/services/pricing.service";
import PricingClient from "./pricing-client";

export const dynamic = "force-dynamic";

/** Fiyatlandırma genel görünümü: aktif fiyatlar + fiyat geçmişi. */
export default async function PricingPage() {
  const { prices, history } = await getPricingOverview();

  const activeCount = prices.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiyat Listesi"
        description="Müşteri ve kargo firması bazlı satış/maliyet tarifeleri"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Aktif Fiyat" value={String(activeCount)} />
        <StatCard label="Toplam Fiyat" value={String(prices.length)} />
        <StatCard label="Tarihsel Değişim" value={String(history.length)} />
      </div>

      <PricingClient initialPrices={prices} initialHistory={history} />
    </div>
  );
}
