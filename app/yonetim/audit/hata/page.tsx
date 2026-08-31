import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function HataLoglarPage() {
  await requireStaff();
  return (
    <AuditLogsPage
      title="Hata Logları"
      description="Sistem ve entegrasyon hata kayıtları (hassas veri içermez)"
    />
  );
}
