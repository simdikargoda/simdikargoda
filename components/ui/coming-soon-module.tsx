"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Inbox, Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";

export function ComingSoonModule({
  title,
  description = "Bu listede görüntülenecek herhangi bir kayıt bulunamadı.",
}: {
  title: string;
  description?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isNewPage = pathname?.endsWith("/yeni");

  return (
    <div className="space-y-6 fade-in-up pb-12 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <PageHeader title={title} description="Veri Listesi" />
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden rounded-[32px] border border-panel-secondary bg-panel-secondary/20 p-8 text-center shadow-inner min-h-[400px]">
        
        <div className="relative z-10 flex flex-col items-center max-w-lg">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-panel-secondary/50 shadow-sm ring-1 ring-panel-secondary">
            <Inbox className="h-10 w-10 text-muted" />
          </div>
          
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Henüz Kayıt Yok
          </h2>
          
          <p className="mb-8 text-sm leading-relaxed text-muted sm:text-base">
            {title} kategorisine ait hiçbir veri bulunamadı. {description} Sisteme yeni veri eklendiğinde burada listelenecektir.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isNewPage && (
              <button
                onClick={() => router.push(`${pathname}/yeni`)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105 hover:bg-primary-strong focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <Plus className="h-4 w-4" />
                Yeni Kayıt Ekle
              </button>
            )}
            <button
              onClick={() => {
                router.refresh();
                toast("Tablo güncelleniyor...", {
                  description: "Güncel veriler sunucudan kontrol edildi. Herhangi bir değişiklik yok.",
                  icon: <RefreshCcw className="h-4 w-4 animate-spin" />,
                });
              }}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-panel-secondary bg-white px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-panel-secondary focus:outline-none"
            >
              <RefreshCcw className="h-4 w-4" />
              Yenile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
