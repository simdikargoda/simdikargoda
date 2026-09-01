"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

type CurrentAccountRow = {
  id: string;
  customerId: string;
  debitKurus: number;
  limitKurus: number;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  customerStatus: string;
};

export function CurrentAccountsTable({
  accounts,
  initialQ,
}: {
  accounts: CurrentAccountRow[];
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

  const formatTL = (kurus: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(kurus / 100);
  };

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
              placeholder="Firma adı veya e-posta ara..."
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

      {accounts.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sonuç bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun cari hesap bulunamadı."
              : "Sistemde henüz cari müşteri kaydı bulunmuyor."
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel-secondary/30">
                <tr>
                  <th className="px-5 py-3.5 font-medium text-muted">Müşteri Bilgisi</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Güncel Borç</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Cari Limit</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Kalan Limit</th>
                  <th className="px-5 py-3.5 font-medium text-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {accounts.map((acc) => {
                  const remainingLimit = acc.limitKurus - acc.debitKurus;
                  const limitDanger = remainingLimit < 0;

                  return (
                    <tr
                      key={acc.id}
                      className="group transition-colors hover:bg-panel-secondary/20"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{acc.customerName}</span>
                          <span className="text-xs text-muted">{acc.customerEmail}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          color={acc.customerStatus === "active" ? "green" : "slate"}
                          label={acc.customerStatus === "active" ? "Aktif" : "Pasif"}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-mono text-base font-semibold text-danger">
                          {formatTL(acc.debitKurus)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-muted font-mono">
                        {formatTL(acc.limitKurus)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-mono font-medium ${
                            limitDanger ? "text-danger bg-danger/10 px-2 py-1 rounded" : "text-success"
                          }`}
                        >
                          {formatTL(remainingLimit)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/yonetim/musteriler/${acc.customerId}`}
                            className="inline-flex items-center justify-center rounded-lg bg-panel-secondary p-2 text-muted transition hover:bg-primary/10 hover:text-primary"
                            title="Detaylara git"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
