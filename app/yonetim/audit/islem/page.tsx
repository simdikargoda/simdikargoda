import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function IslemLoglarPage() {
  await requireStaff();
  return (
    <AuditLogsPage
      title="İşlem Logları"
      description="Kritik yönetim işlemlerinin audit geçmişi"
    />
  );
}
