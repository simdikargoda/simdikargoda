import CurrentAccountTransactionsPage from "@/components/finance/current-account-transactions-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TahsilatlarPage() {
  await requireStaff();
  return <CurrentAccountTransactionsPage />;
}
