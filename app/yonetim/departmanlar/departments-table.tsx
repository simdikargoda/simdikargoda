"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

type DepartmentRow = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

export function DepartmentsTable({
  departments,
  initialQ,
}: {
  departments: DepartmentRow[];
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
              placeholder="Departman adı ara..."
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

      {departments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Departman bulunamadı"
          description={
            initialQ
              ? "Arama kriterlerinize uygun departman bulunamadı."
              : "Sistemde henüz oluşturulmuş bir departman yok."
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel-secondary/30">
                <tr>
                  <th className="px-5 py-3.5 font-medium text-muted">Departman Adı</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Açıklama</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Durum</th>
                  <th className="px-5 py-3.5 font-medium text-muted">Oluşturulma</th>
                  <th className="px-5 py-3.5 font-medium text-muted"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {departments.map((d) => (
                  <tr
                    key={d.id}
                    className="group transition-colors hover:bg-panel-secondary/20"
                  >
                    <td className="px-5 py-4 font-semibold text-foreground">
                      {d.name}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {d.description || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        color={d.isActive ? "green" : "slate"}
                        label={d.isActive ? "Aktif" : "Pasif"}
                      />
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {format(new Date(d.createdAt), "dd MMM yyyy", { locale: tr })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-danger hover:bg-danger/10">
                          <Trash2 className="h-4 w-4" />
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
