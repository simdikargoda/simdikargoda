import SmsLogsListPage from "@/components/notifications/sms-logs-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SmsLoglarPage() {
  await requireAdmin();
  return (
    <SmsLogsListPage
      title="SMS Logları"
      description="Tüm SMS gönderim kayıtlarının geçmişi"
    />
  );
}
