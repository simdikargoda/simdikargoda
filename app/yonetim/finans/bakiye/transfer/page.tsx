import BalanceTransactionsPage from "@/components/finance/balance-transactions-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Banka transferleri (bakiye yükleme) akışı: Havale talepleri "Bekleyen
 * Bakiye Yükleme Talepleri" bölümünden onaylanır; onay transaction-safe
 * olarak bakiyeye eklenir. Otomatik başarı varsayılmaz. Bu ekran, tek gerçek
 * veri kaynağı olan bakiye hareketleri görünümüne bağlanır.
 */
export default async function BankaTransferleriPage() {
  await requireAdmin();
  return <BalanceTransactionsPage />;
}
