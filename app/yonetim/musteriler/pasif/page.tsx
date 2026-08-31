import CustomerListPage from "@/components/customers/customer-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function PasifMusterilerPage() {
  await requireStaff();
  return (
    <CustomerListPage
      title="Pasif Müşteriler"
      description="Pasif duruma alınmış müşteriler"
      status="passive"
    />
  );
}
