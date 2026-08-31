"use client";
import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { Plug, ShoppingBag, MessageSquare, CreditCard, CheckCircle2, Settings2, XCircle, Github, CloudUpload, Database } from "lucide-react";
import { cn } from "@/lib/cn";

const INTEGRATIONS = [
  { id: "trendyol", name: "Trendyol", type: "Pazaryeri", status: "active", icon: ShoppingBag, color: "bg-orange-500" },
  { id: "hepsiburada", name: "Hepsiburada", type: "Pazaryeri", status: "inactive", icon: ShoppingBag, color: "bg-orange-600" },
  { id: "netgsm", name: "NetGSM SMS", type: "Bildirim", status: "active", icon: MessageSquare, color: "bg-blue-600" },
  { id: "stripe", name: "Stripe", type: "Ödeme Geçidi", status: "inactive", icon: CreditCard, color: "bg-indigo-500" },
  { id: "iyzico", name: "Iyzico", type: "Ödeme Geçidi", status: "error", icon: CreditCard, color: "bg-blue-500" },
  { id: "amazon", name: "Amazon", type: "Pazaryeri", status: "inactive", icon: ShoppingBag, color: "bg-slate-800" },
  { id: "github", name: "GitHub", type: "Kod ve Yedekleme", status: "active", icon: Github, color: "bg-neutral-900" },
  { id: "vercel", name: "Vercel", type: "Dağıtım ve Sunucu", status: "active", icon: CloudUpload, color: "bg-black" },
  { id: "supabase", name: "Supabase", type: "Veritabanı ve Backend", status: "active", icon: Database, color: "bg-emerald-600" },
];

export default function EntegrasyonlarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Diğer Entegrasyonlar"
        description="Pazaryeri, SMS ve Ödeme geçidi yapılandırmaları"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className="group cursor-pointer rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-float"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-soft", integration.color)}>
                  <integration.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                    {integration.status === "active" && (
                      <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Bağlantı Aktif</span>
                    )}
                    {integration.status === "inactive" && (
                      <span className="flex items-center gap-1 text-muted"><Settings2 className="h-3.5 w-3.5" /> Yapılandırılmadı</span>
                    )}
                    {integration.status === "error" && (
                      <span className="flex items-center gap-1 text-danger"><XCircle className="h-3.5 w-3.5" /> Bağlantı Hatası</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex items-center justify-between border-t border-panel-secondary pt-4 text-xs text-muted">
              <span>{integration.type}</span>
              <Link href={`/yonetim/entegrasyonlar/${integration.id}`} className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline">Yapılandır &rarr;</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
