import AuditLogsPage from "@/components/audit/audit-logs-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function ApiWebhookLoglarPage() {
  await requireAdmin();
  return (
    <AuditLogsPage
      title="API / Webhook Logları"
      description="API ve webhook kaynaklı audit kayıtları"
    />
  );
}
