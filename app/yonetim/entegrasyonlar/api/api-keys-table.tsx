"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Key, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

type ApiKeyRow = {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  key: string;
  lastUsedAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
};

export function ApiKeysTable({
  apiKeys,
  initialQ,
}: {
  apiKeys: ApiKeyRow[];
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

  function maskKey(key: string) {
    if (key.length < 12) return "********";
    return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
  }

  return (
    <div className="space-y-4">
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
              placeholder="Firma veya anahtar adı ara..."
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

      {apiKeys.length === 0 ? (
        <EmptyState
          icon={Key}
          title="API Anahtarı bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun API anahtarı bulunamadı."
              : "Sistemde henüz oluşturulmuş bir API anahtarı yok."
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel-secondary/30">
                <tr>
                  <th className="px-5 py-3.5 font-medium text-muted">Müşteri</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Anahtar Adı</th>
                  <th className="px-5 py-3.5 font-medium text-muted">API Key</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Son Kullanım</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Oluşturulma</th>
                  <th className="px-5 py-3.5 font-medium text-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {apiKeys.map((k) => (
                  <tr
                    key={k.id}
                    className="group transition-colors hover:bg-panel-secondary/20"
                  >
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {k.customerName}
                    </td>
                    <td className="px-5 py-4 text-foreground font-medium">
                      {k.name}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm tracking-wider bg-panel-secondary/50 px-2 py-1 rounded">
                          {maskKey(k.key)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        color={k.isActive ? "green" : "rose"}
                        label={k.isActive ? "Aktif" : "İptal Edildi"}
                      />
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {k.lastUsedAt ? format(new Date(k.lastUsedAt), "dd MMM yyyy HH:mm", { locale: tr }) : "Hiç kullanılmadı"}
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {format(new Date(k.createdAt), "dd MMM yyyy", { locale: tr })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {k.isActive && (
                        <Button variant="ghost" className="h-8 px-2 text-danger hover:bg-danger/10 hover:text-danger">
                          İptal Et
                        </Button>
                      )}
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
