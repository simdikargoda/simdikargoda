import { PageHeader } from "@/components/ui/page-header";
import { CurrentAccountsTable } from "./current-accounts-table";
import { getCurrentAccounts } from "@/lib/queries/finance.queries";

export const dynamic = "force-dynamic";

export default async function CariHesaplarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const accounts = await getCurrentAccounts();
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
        title="Cari Hesaplar"
        description="Cari müşterilerin güncel borç/alacak durumlarını, limitlerini ve tahsilatlarını yönetin."
      />
      <CurrentAccountsTable accounts={filtered} initialQ={q} />
    </div>
  );
}
