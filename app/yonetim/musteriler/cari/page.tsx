import CustomerListPage from "@/components/customers/customer-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function CariMusterilerPage() {
  await requireAdmin();
  return (
    <CustomerListPage
      title="Cari Müşteriler"
      description="Cari (faturalı) çalışma modelindeki müşteriler"
      type="current_account"
    />
  );
}
