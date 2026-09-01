import SmsLogsListPage from "@/components/notifications/sms-logs-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SmsLoglarPage() {
  await requireStaff();
  return (
    <SmsLogsListPage
      title="SMS Logları"
      description="Tüm SMS gönderim kayıtlarının geçmişi"
    />
  );
}
