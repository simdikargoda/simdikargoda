import CustomerListPage from "@/components/customers/customer-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function OnOdemeliMusterilerPage() {
  await requireAdmin();
  return (
    <CustomerListPage
      title="Ön Ödemeli Müşteriler"
      description="Bakiyeli (ön ödemeli) çalışma modelindeki müşteriler"
      type="balance"
    />
  );
}
