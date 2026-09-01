import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function EntegrasyonLoglarAuditPage() {
  await requireStaff();
  return (
    <AuditLogsPage
      title="Entegrasyon Logları"
      description="Entegrasyon ve sağlayıcı yönetimi audit kayıtları"
    />
  );
}
