import CustomerListPage from "@/components/customers/customer-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function OnOdemeliMusterilerPage() {
  await requireStaff();
  return (
    <CustomerListPage
      title="Ön Ödemeli Müşteriler"
      description="Bakiyeli (ön ödemeli) çalışma modelindeki müşteriler"
      type="balance"
    />
  );
}
