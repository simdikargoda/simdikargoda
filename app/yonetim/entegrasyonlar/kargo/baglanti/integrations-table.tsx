"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Link as LinkIcon, Settings2, Activity } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

type IntegrationRow = {
  id: string;
  provider: string;
  status: "active" | "unconfigured" | "connection_error" | "temporary_issue" | "disabled";
  configured: boolean;
  lastTestAt: Date | null;
  lastTestResult: any;
  note: string | null;
};

export function IntegrationsTable({
  integrations,
  initialQ,
}: {
  integrations: IntegrationRow[];
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

  function getStatusColor(status: IntegrationRow["status"]): "green" | "slate" | "rose" | "amber" {
    switch (status) {
      case "active":
        return "green";
      case "unconfigured":
        return "slate";
      case "connection_error":
        return "rose";
      case "temporary_issue":
        return "amber";
      case "disabled":
        return "slate";
      default:
        return "slate";
    }
  }

  function getStatusLabel(status: IntegrationRow["status"]) {
    switch (status) {
      case "active":
        return "Aktif";
      case "unconfigured":
        return "Yapılandırılmadı";
      case "connection_error":
        return "Bağlantı Hatası";
      case "temporary_issue":
        return "Geçici Sorun";
      case "disabled":
        return "Devre Dışı";
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
              placeholder="Kargo firması ara..."
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

      {integrations.length === 0 ? (
        <EmptyState
          icon={LinkIcon}
          title="Kayıt bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun entegrasyon bulunamadı."
              : "Sistemde henüz entegrasyon kaydı bulunmuyor."
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel-secondary/30">
                <tr>
                  <th className="px-5 py-3.5 font-medium text-muted">Sağlayıcı</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Son Test</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Notlar</th>
                  <th className="px-5 py-3.5 font-medium text-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {integrations.map((i) => (
                  <tr
                    key={i.id}
                    className="group transition-colors hover:bg-panel-secondary/20"
                  >
                    <td className="px-5 py-4 uppercase font-bold text-foreground">
                      {i.provider}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        color={getStatusColor(i.status)}
                        label={getStatusLabel(i.status)}
                      />
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {i.lastTestAt ? format(new Date(i.lastTestAt), "dd MMM yyyy HH:mm", { locale: tr }) : "Hiç test edilmedi"}
                    </td>
                    <td className="px-5 py-4 text-muted max-w-[200px] truncate">
                      {i.note || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" className="h-8 px-2 text-muted hover:text-primary gap-1">
                          <Activity className="h-4 w-4" />
                          Test Et
                        </Button>
                        <Button variant="ghost" className="h-8 px-2 text-muted hover:bg-panel-secondary hover:text-foreground gap-1">
                          <Settings2 className="h-4 w-4" />
                          Yapılandır
                        </Button>
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
