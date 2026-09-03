import { PageHeader } from "@/components/ui/page-header";
import { getIntegrations } from "@/lib/queries/integration.queries";
import { requireAdmin } from "@/lib/guard";
import { IntegrationsTable } from "./integrations-table";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  
  const integrations = await getIntegrations();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";

  const filtered = integrations.filter((integration) => {
    if (q) {
      const haystack = `${integration.provider} ${integration.note ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Kargo Firma Bağlantıları"
        description="Sistemdeki tüm kargo firması API bağlantılarını yönetin ve test edin."
      />
      <IntegrationsTable integrations={filtered} initialQ={q} />
    </div>
  );
}
