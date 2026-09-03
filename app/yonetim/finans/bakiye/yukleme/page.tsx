import BalanceTransactionsPage from "@/components/finance/balance-transactions-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Bakiye yükleme (havale) akışı: talep, hareketler ekranındaki "Bekleyen
 * Bakiye Yükleme Talepleri" bölümünden yönetilir (gerçek onay, approval service);
 * onaylanmadan bakiye aktifleşmez. Tekrar eden veri gösterilmez.
 */
export default async function BakiyeYuklemePage() {
  await requireAdmin();
  return <BalanceTransactionsPage />;
}
