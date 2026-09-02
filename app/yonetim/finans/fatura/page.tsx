import { PageHeader } from "@/components/ui/page-header";
import { getInvoices } from "@/lib/queries/invoice.queries";
import { requireStaff } from "@/lib/guard";
import { InvoicesTable } from "./invoices-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FaturalarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireStaff();
  
  const invoices = await getInvoices();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";
  const status = params.status ?? "";

  const filtered = invoices.filter((inv) => {
    if (status && inv.status !== status) return false;
    if (q) {
      const haystack = `${inv.customerName} ${inv.invoiceNo ?? ""} ${inv.customerEmail}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Faturalar"
        description="Müşterilere kesilen faturaları ve ödeme durumlarını yönetin."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Fatura
          </Button>
        }
      />
      <InvoicesTable invoices={filtered} initialQ={q} />
    </div>
  );
}
