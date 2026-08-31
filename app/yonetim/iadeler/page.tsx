"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Search, RotateCcw, Filter, MoreHorizontal, Check, X } from "lucide-react";

const MOCK_RETURNS: any[] = [];

export default function IadelerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="İade Talepleri"
        description="Müşteri iptal ve iade süreçlerinin yönetimi"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-panel-secondary bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="İade No veya Kargo No ile ara..."
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
                <th className="px-6 py-4 font-semibold">İade No</th>
                <th className="px-6 py-4 font-semibold">Kargo No</th>
                <th className="px-6 py-4 font-semibold">Müşteri</th>
                <th className="px-6 py-4 font-semibold">Sebep</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold">Tarih</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {MOCK_RETURNS.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50">
                        <RotateCcw className="h-6 w-6" />
                      </div>
                      <p className="text-base font-medium text-foreground">İade Talebi Bulunamadı</p>
                      <p className="text-sm">Şu anda bekleyen veya geçmiş bir iade talebi bulunmuyor.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                MOCK_RETURNS.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-panel/50">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">{item.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-primary hover:underline cursor-pointer">{item.trackingNo}</td>
                    <td className="whitespace-nowrap px-6 py-4">{item.customer}</td>
                    <td className="whitespace-nowrap px-6 py-4">{item.reason}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {item.status === "pending" && <span className="inline-flex rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">Bekliyor</span>}
                      {item.status === "approved" && <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Onaylandı</span>}
                      {item.status === "rejected" && <span className="inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">Reddedildi</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted">{item.date}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {item.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button className="rounded bg-success/10 p-1.5 text-success hover:bg-success/20" title="Onayla"><Check className="h-4 w-4" /></button>
                          <button className="rounded bg-danger/10 p-1.5 text-danger hover:bg-danger/20" title="Reddet"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <button className="rounded p-1.5 text-muted hover:bg-panel-secondary hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
