import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AuditSayfasi() {
  await requireStaff();
  return (
    <AuditLogsPage
      title="Sistem Logları (Audit)"
      description="Kullanıcı işlemlerinin ve sistem olaylarının kayıtları"
    />
  );
}
