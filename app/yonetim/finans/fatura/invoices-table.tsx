"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Receipt, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatKurus } from "@/lib/money";

type InvoiceRow = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  invoiceNo: string | null;
  totalKurus: number;
  taxKurus: number;
  status: "draft" | "issued" | "paid" | "cancelled";
  dueDate: Date | null;
  issuedAt: Date | null;
  createdAt: Date;
};

export function InvoicesTable({
  invoices,
  initialQ,
}: {
  invoices: InvoiceRow[];
  initialQ: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    router.push(url.pathname + url.search);
  }

  function getStatusColor(status: InvoiceRow["status"]): "slate" | "blue" | "green" | "rose" {
    switch (status) {
      case "draft":
        return "slate";
      case "issued":
        return "blue";
      case "paid":
        return "green";
      case "cancelled":
        return "rose";
      default:
        return "slate";
    }
  }

  function getStatusLabel(status: InvoiceRow["status"]) {
    switch (status) {
      case "draft":
        return "Taslak";
      case "issued":
        return "Kesildi";
      case "paid":
        return "Ödendi";
      case "cancelled":
        return "İptal";
      default:
        return status;
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="card-surface p-3 flex flex-wrap gap-3 items-center justify-between">
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2 min-w-[280px] max-w-md"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              type="search"
              placeholder="Firma adı, e-posta veya fatura no ara..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-panel-secondary bg-panel/50 py-2 pl-9 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-panel-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-panel-secondary/80"
          >
            Ara
          </button>
        </form>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Fatura bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun fatura bulunamadı."
              : "Sistemde henüz fatura kaydı bulunmuyor."
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel-secondary/30">
                <tr>
                  <th className="px-5 py-3.5 font-medium text-muted">Fatura No</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Müşteri</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Tarih</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Tutar (KDV Dahil)</th>
                  <th className="px-5 py-3.5 font-medium text-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="group transition-colors hover:bg-panel-secondary/20"
                  >
                    <td className="px-5 py-4">
                      {inv.invoiceNo ? (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted" />
                          <span className="font-mono font-medium text-foreground">{inv.invoiceNo}</span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs italic">Belirlenmedi</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{inv.customerName}</span>
                        <span className="text-xs text-muted">{inv.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        color={getStatusColor(inv.status)}
                        label={getStatusLabel(inv.status)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-sm text-foreground">
                        {inv.issuedAt ? format(new Date(inv.issuedAt), "dd MMM yyyy", { locale: tr }) : "-"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-base font-semibold text-foreground">
                        {formatKurus(inv.totalKurus)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/yonetim/finans/fatura/${inv.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-panel-secondary p-2 text-muted transition hover:bg-primary/10 hover:text-primary"
                          title="Detaylara git"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
