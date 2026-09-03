import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function HataLoglarPage() {
  await requireAdmin();
  return (
    <AuditLogsPage
      title="Hata Logları"
      description="Sistem ve entegrasyon hata kayıtları (hassas veri içermez)"
    />
  );
}
