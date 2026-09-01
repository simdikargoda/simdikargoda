import SmsLogsListPage from "@/components/notifications/sms-logs-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SmsSayfasi() {
  await requireStaff();
  return (
    <SmsLogsListPage
      title="SMS Gönderimleri"
      description="Müşterilere gönderilen SMS'lerin gerçek durumu"
    />
  );
}
