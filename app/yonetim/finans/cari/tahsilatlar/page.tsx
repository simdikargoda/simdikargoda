import CurrentAccountTransactionsPage from "@/components/finance/current-account-transactions-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TahsilatlarPage() {
  await requireAdmin();
  return <CurrentAccountTransactionsPage />;
}
