"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Search, Filter, MessageSquareText } from "lucide-react";

export default function SMSPage() {
  const SMS_LOGS: any[] = [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Bildirim Logları"
        description="Müşterilere gönderilen otomatik mesajların geçmişi"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-panel-secondary bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Telefon No veya Mesaj içeriği ara..."
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
                <th className="px-6 py-4 font-semibold">Alıcı (Tel)</th>
                <th className="px-6 py-4 font-semibold">Mesaj İçeriği</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Sağlayıcı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {SMS_LOGS.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50">
                        <MessageSquareText className="h-6 w-6" />
                      </div>
                      <p className="text-base font-medium text-foreground">SMS Logu Bulunamadı</p>
                      <p className="text-sm">Sistem üzerinden henüz herhangi bir SMS gönderimi yapılmamış.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Real data will map here
                null
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
