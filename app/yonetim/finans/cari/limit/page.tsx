import CurrentAccountTransactionsPage from "@/components/finance/current-account-transactions-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Limit durumları ekranı: kullanılabilir limit ve kritik eşik bilgisi
 * cari hesap listesinden (CurrentAccountsTable) ve "Kritik Bakiyeler"
 * görünümünden izlenir. Bu rota, cari hareketler ekranındaki domain
 * verisine yönlendirilir (kopyalanmaz).
 */
export default async function LimitDurumlarPage() {
  await requireStaff();
  return <CurrentAccountTransactionsPage />;
}
