import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Truck } from "lucide-react";
import { requireStaff } from "@/lib/guard";
import { getAllProviderStatuses } from "@/lib/providers/cargo/registry";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PROVIDER_LABEL: Record<string, string> = {
  aras: "Aras Kargo",
  dhl: "DHL",
  hepsijet: "HepsiJET",
  ptt: "PTT Kargo",
};

/**
 * Kargo firması entegrasyonları — gerçek registry config durumundan türetilir.
 * Resmi API dokümanı / credential temin edilene kadar her firma
 * "Doküman Bekleniyor" durumunda listelenir; sahte durum yoktur.
 */
export default async function KargoEntegrasyonlarPage() {
  await requireStaff();
  const statuses = getAllProviderStatuses();

  const list = Object.entries(statuses).map(([id, st]) => ({
    id,
    label: PROVIDER_LABEL[id] ?? id,
    configured: st.configured,
    pendingDocumentation: st.pendingDocumentation,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kargo Firmaları"
        description="Gönderi entegrasyonu ve bağlantı durumları"
        actions={
          <Link
            href="/yonetim/entegrasyonlar/kargo/yeni"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <Truck className="h-4 w-4" />
            Yeni Firma Ekle
          </Link>
        }
      />

      {list.length === 0 ? (
        <EmptyState title="Firma yok" description="Henüz kargo firması tanımlanmadı." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/yonetim/entegrasyonlar/kargo/${p.id}`}
              className="group block rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-float"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-soft group-hover:bg-primary group-hover:text-white transition-colors">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{p.label}</h3>
                    <div className="mt-1">
                      <span className="inline-flex rounded-full bg-panel-secondary px-2.5 py-1 text-xs font-semibold text-muted">
                        {p.configured
                          ? "Yapılandırıldı"
                          : "Yapılandırma Bekleniyor"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-panel-secondary pt-4 text-xs text-muted">
                <span>
                  {p.configured
                    ? "Resmi credential girildi; doküman kontrolü bekleniyor."
                    : "Servis bilgilerini ve API anahtarlarını yapılandırın."}
                </span>
                <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline">
                  Yapılandır &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
