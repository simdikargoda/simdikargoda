"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Tag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatKurus } from "@/lib/money";

type CustomPriceRow = {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  provider: string;
  type: "fixed" | "per_weight" | "per_desi";
  priceKurus: number;
  costKurus: number;
  breakpoint: number | null;
  isActive: boolean;
  createdAt: Date;
};

export function CustomPricesTable({
  prices,
  initialQ,
}: {
  prices: CustomPriceRow[];
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
              placeholder="Firma veya kargo firması ara..."
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

      {prices.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Kayıt bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun özel fiyat tarifesi bulunamadı."
              : "Sistemde henüz özel fiyat tarifesi bulunmuyor."
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel-secondary/30">
                <tr>
                  <th className="px-5 py-3.5 font-medium text-muted">Müşteri</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Sağlayıcı</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Tarife Tipi</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Fiyat</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Oluşturulma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {prices.map((p) => (
                  <tr
                    key={p.id}
                    className="group transition-colors hover:bg-panel-secondary/20"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{p.customerName}</span>
                        <span className="text-xs text-muted">{p.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 uppercase font-medium text-muted">
                      {p.provider}
                    </td>
                    <td className="px-5 py-4">
                      {p.type === "fixed" ? "Sabit" : p.type === "per_weight" ? "Ağırlık Bazlı" : "Desi Bazlı"}
                      {p.breakpoint && <span className="text-xs text-muted block">Eşik: {p.breakpoint}</span>}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-mono text-base font-semibold text-primary">
                        {formatKurus(p.priceKurus)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        color={p.isActive ? "green" : "slate"}
                        label={p.isActive ? "Aktif" : "Pasif"}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-sm text-foreground">
                        {format(new Date(p.createdAt), "dd MMM yyyy", { locale: tr })}
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
