import BalanceTransactionsPage from "@/components/finance/balance-transactions-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function BakiyeHareketleriPage() {
  await requireStaff();
  return <BalanceTransactionsPage />;
}
