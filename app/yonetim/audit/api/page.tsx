import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function ApiWebhookLoglarPage() {
  await requireStaff();
  return (
    <AuditLogsPage
      title="API / Webhook Logları"
      description="API ve webhook kaynaklı audit kayıtları"
    />
  );
}
