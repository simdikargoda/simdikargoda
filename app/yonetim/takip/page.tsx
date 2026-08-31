"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Search, MapPin, Truck, PackageCheck, Box } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";

const TIMELINE: any[] = [];

export default function TakipPage() {
  const [trackingNo, setTrackingNo] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kargo Takip"
        description="Gönderilerin anlık lokasyon ve durum sorgulaması"
      />

      <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-sm">
        <div className="flex max-w-2xl gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              className="block w-full rounded-xl border border-panel-secondary bg-white py-3 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Takip Numarası Girin..."
            />
          </div>
          <button 
            onClick={() => trackingNo.length > 3 && setSearched(true)}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90"
          >
            Sorgula
          </button>
        </div>
      </div>

      {searched && TIMELINE.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-panel-secondary bg-white p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50 text-muted mb-4">
            <PackageCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Kargo Bulunamadı</h3>
          <p className="mt-2 text-sm text-muted max-w-md">
            "{trackingNo}" takip numarasına ait herhangi bir gönderi kaydına ulaşılamadı. Lütfen numarayı kontrol edip tekrar deneyin.
          </p>
        </div>
      )}

      {searched && TIMELINE.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4">Gönderi Detayları</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-panel-secondary pb-2">
                  <dt className="text-muted">Kargo Firması:</dt>
                  <dd className="font-medium">-</dd>
                </div>
                <div className="flex justify-between border-b border-panel-secondary pb-2">
                  <dt className="text-muted">Çıkış Şubesi:</dt>
                  <dd className="font-medium">-</dd>
                </div>
                <div className="flex justify-between border-b border-panel-secondary pb-2">
                  <dt className="text-muted">Varış Şubesi:</dt>
                  <dd className="font-medium">-</dd>
                </div>
                <div className="flex justify-between border-b border-panel-secondary pb-2">
                  <dt className="text-muted">Ağırlık/Desi:</dt>
                  <dd className="font-medium">-</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-sm h-full">
              <h3 className="font-semibold text-foreground mb-6">Hareket Dökümü</h3>
              <div className="relative border-l-2 border-panel-secondary ml-4 space-y-8">
                {TIMELINE.map((step, idx) => (
                  <div key={step.id} className="relative pl-8">
                    <div className={cn("absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white", step.color)}>
                      <step.icon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <h4 className={cn("text-sm font-bold", idx === 0 ? "text-foreground" : "text-muted")}>{step.title}</h4>
                        <p className="text-xs text-muted mt-1">{step.desc}</p>
                      </div>
                      <span className="text-[10px] font-medium text-muted/80">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
