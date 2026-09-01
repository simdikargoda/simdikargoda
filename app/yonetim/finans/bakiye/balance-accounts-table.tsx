"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";

type BalanceAccountRow = {
  id: string;
  customerId: string;
  balanceKurus: number;
  updatedAt: Date;
  customerName: string;
  customerEmail: string;
  customerStatus: string;
};

export function BalanceAccountsTable({
  accounts,
  initialQ,
}: {
  accounts: BalanceAccountRow[];
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
          icon={Wallet}
          title="Sonuç bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun bakiye hesabı bulunamadı."
              : "Sistemde henüz bakiyeli müşteri kaydı bulunmuyor."
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
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Mevcut Bakiye</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Son İşlem</th>
                  <th className="px-5 py-3.5 font-medium text-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {accounts.map((acc) => (
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
                      <span
                        className={`font-mono text-base font-semibold ${
                          acc.balanceKurus < 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {formatTL(acc.balanceKurus)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-muted text-xs">
                        {new Date(acc.updatedAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
