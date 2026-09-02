"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, History } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";

type PriceAuditRow = {
  id: string;
  priceId: string | null;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  provider: string;
  oldValueKurus: number | null;
  newValueKurus: number | null;
  changedAt: Date;
};

export function PriceAuditTable({
  logs,
  initialQ,
}: {
  logs: PriceAuditRow[];
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

      {logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Geçmiş bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun fiyat değişikliği bulunamadı."
              : "Sistemde henüz kaydedilmiş bir fiyat değişikliği yok."
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
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Eski Fiyat</th>
                  <th className="px-5 py-3.5 font-medium text-muted text-right">Yeni Fiyat</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Değişim Tarihi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="group transition-colors hover:bg-panel-secondary/20"
                  >
                    <td className="px-5 py-4">
                      {log.customerName ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{log.customerName}</span>
                          <span className="text-xs text-muted">{log.customerEmail}</span>
                        </div>
                      ) : (
                        <span className="text-muted italic">Bilinmiyor</span>
                      )}
                    </td>
                    <td className="px-5 py-4 uppercase font-medium text-muted">
                      {log.provider}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {log.oldValueKurus !== null ? (
                        <span className="font-mono text-base font-semibold text-muted line-through">
                          {formatKurus(log.oldValueKurus)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted italic">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {log.newValueKurus !== null ? (
                        <span className="font-mono text-base font-semibold text-primary">
                          {formatKurus(log.newValueKurus)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted italic">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-sm text-foreground">
                        {format(new Date(log.changedAt), "dd MMM yyyy HH:mm", { locale: tr })}
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
