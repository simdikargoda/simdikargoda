import { PageHeader } from "@/components/ui/page-header";
import { CustomersTable } from "./customers-table";
import { NewCustomerButton } from "./new-customer-button";

import { getCustomers } from "@/lib/queries/customer.queries";

export const dynamic = "force-dynamic";

export default async function MusterilerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; tip?: string }>;
}) {
  const customers = await getCustomers();
  const params = await searchParams;

  const q = params.q?.toLowerCase() ?? "";
  const durum = params.durum ?? "";
  const tip = params.tip ?? "";

  const filtered = customers.filter((c) => {
    if (durum && c.status !== durum) return false;
    if (tip && c.type !== tip) return false;
    if (q) {
      const haystack = `${c.name} ${c.authorizedPerson ?? ""} ${c.email} ${c.phone}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Müşteriler"
        description="Müşteri kayıtlarını yönetin"
        actions={<NewCustomerButton />}
      />
      <CustomersTable customers={filtered} initialQ={q} />
    </div>
  );
}
