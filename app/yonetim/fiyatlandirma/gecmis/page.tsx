import { PageHeader } from "@/components/ui/page-header";
import { getPriceAuditLogs } from "@/lib/queries/pricing.queries";
import { requireStaff } from "@/lib/guard";
import { PriceAuditTable } from "./price-audit-table";

export const dynamic = "force-dynamic";

export default async function PriceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  
  const logs = await getPriceAuditLogs();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";

  const filtered = logs.filter((log) => {
    if (q) {
      const haystack = `${log.customerName} ${log.provider}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Fiyatlandırma Geçmişi"
        description="Müşteri özel fiyat tarifelerinde yapılan değişikliklerin tam listesi."
      />
      <PriceAuditTable logs={filtered} initialQ={q} />
    </div>
  );
}
