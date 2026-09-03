import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function IslemLoglarPage() {
  await requireAdmin();
  return (
    <AuditLogsPage
      title="İşlem Logları"
      description="Kritik yönetim işlemlerinin audit geçmişi"
    />
  );
}
