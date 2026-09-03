import BalanceTransactionsPage from "@/components/finance/balance-transactions-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function BakiyeHareketleriPage() {
  await requireAdmin();
  return <BalanceTransactionsPage />;
}
