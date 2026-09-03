import { PageHeader } from "@/components/ui/page-header";
import { getApiKeys } from "@/lib/queries/integration.queries";
import { requireAdmin } from "@/lib/guard";
import { ApiKeysTable } from "./api-keys-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  
  const keys = await getApiKeys();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";

  const filtered = keys.filter((k) => {
    if (q) {
      const haystack = `${k.customerName} ${k.name}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="API Anahtarları"
        description="Müşterilerin sisteme entegre olabilmesi için gereken API anahtarlarını yönetin."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            API Anahtarı Oluştur
          </Button>
        }
      />
      <ApiKeysTable apiKeys={filtered} initialQ={q} />
    </div>
  );
}
