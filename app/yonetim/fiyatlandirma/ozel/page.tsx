import { PageHeader } from "@/components/ui/page-header";
import { getCustomPrices } from "@/lib/queries/pricing.queries";
import { requireAdmin } from "@/lib/guard";
import { CustomPricesTable } from "./custom-prices-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  
  const prices = await getCustomPrices();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";

  const filtered = prices.filter((p) => {
    if (q) {
      const haystack = `${p.customerName} ${p.provider}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Özel Fiyatlandırma"
        description="Müşteri ve kargo firması bazında özel fiyat tarifeleri tanımlayın."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Fiyat Ekle
          </Button>
        }
      />
      <CustomPricesTable prices={filtered} initialQ={q} />
    </div>
  );
}
