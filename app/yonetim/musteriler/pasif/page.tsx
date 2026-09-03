import CustomerListPage from "@/components/customers/customer-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function PasifMusterilerPage() {
  await requireAdmin();
  return (
    <CustomerListPage
      title="Pasif Müşteriler"
      description="Pasif duruma alınmış müşteriler"
      status="passive"
    />
  );
}
