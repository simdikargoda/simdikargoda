import SmsLogsListPage from "@/components/notifications/sms-logs-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SmsSayfasi() {
  await requireAdmin();
  return (
    <SmsLogsListPage
      title="SMS Gönderimleri"
      description="Müşterilere gönderilen SMS'lerin gerçek durumu"
    />
  );
}
