"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Search, Filter, ScrollText } from "lucide-react";

export default function AuditPage() {
  const AUDIT_LOGS: any[] = [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistem Logları (Audit)"
        description="Kullanıcı işlemlerinin ve sistem olaylarının kayıtları"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-panel-secondary bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="İşlem, kullanıcı veya IP adresi ara..."
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-panel-secondary">
          <Filter className="h-4 w-4 text-muted" /> Filtrele
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-panel-secondary bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-panel-secondary bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Tarih</th>
                <th className="px-6 py-4 font-semibold">Kullanıcı</th>
                <th className="px-6 py-4 font-semibold">İşlem Özeti</th>
                <th className="px-6 py-4 font-semibold">Modül</th>
                <th className="px-6 py-4 font-semibold">IP Adresi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {AUDIT_LOGS.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50">
                        <ScrollText className="h-6 w-6" />
                      </div>
                      <p className="text-base font-medium text-foreground">Kayıt Bulunamadı</p>
                      <p className="text-sm">Gösterilecek herhangi bir sistem aktivitesi (log) bulunmuyor.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                null
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
