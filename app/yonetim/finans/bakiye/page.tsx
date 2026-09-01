import { PageHeader } from "@/components/ui/page-header";
import { BalanceAccountsTable } from "./balance-accounts-table";
import { getBalanceAccounts } from "@/lib/queries/finance.queries";

export const dynamic = "force-dynamic";

export default async function BakiyeIslemleriPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const accounts = await getBalanceAccounts();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";

  const filtered = accounts.filter((a) => {
    if (q) {
      const haystack = `${a.customerName} ${a.customerEmail}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Bakiye İşlemleri"
        description="Bakiyeli müşterilerin hesaplarını, havale/yükleme taleplerini yönetin."
      />
      <BalanceAccountsTable accounts={filtered} initialQ={q} />
    </div>
  );
}
