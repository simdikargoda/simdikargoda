import { PageHeader } from "@/components/ui/page-header";
import { getTeklifler } from "@/lib/services/teklif.service";
import { requireAdmin } from "@/lib/guard";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = {
  title: "Teklifler | Kargo Ops",
};

export default function TekliflerPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Teklifler" 
          description="Müşterilere ve potansiyel müşterilere sunulan kargo fiyat teklifleri." 
        />
        <Link
          href="/yonetim/teklifler/yeni"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Yeni Teklif Oluştur
        </Link>
      </div>

      <div className="rounded-[24px] border border-panel-secondary bg-white shadow-soft">
        <TeklifList />
      </div>
    </div>
  );
}

async function TeklifList() {
  await requireAdmin();
  const teklifler = await getTeklifler();

  if (!teklifler.length) {
    return (
      <div className="p-12">
        <EmptyState
          icon={FileText}
          title="Henüz teklif bulunmuyor"
          description="Sistemde kayıtlı herhangi bir fiyat teklifi yok. Yeni bir teklif oluşturarak başlayabilirsiniz."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-panel-secondary bg-panel">
          <tr>
            <th className="px-6 py-4 font-semibold text-muted">Teklif Başlığı</th>
            <th className="px-6 py-4 font-semibold text-muted">Müşteri / Lead</th>
            <th className="px-6 py-4 font-semibold text-muted">Durum</th>
            <th className="px-6 py-4 font-semibold text-muted">Geçerlilik</th>
            <th className="px-6 py-4 font-semibold text-muted text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-panel-secondary">
          {teklifler.map((t) => (
            <tr key={t.id} className="hover:bg-panel transition-colors">
              <td className="px-6 py-4 font-medium text-foreground">{t.title}</td>
              <td className="px-6 py-4 text-muted">
                {t.leadName ? `${t.leadName} (Lead)` : t.customerId}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  t.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  t.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {t.status === 'approved' ? 'Onaylandı' : t.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                </span>
              </td>
              <td className="px-6 py-4 text-muted">
                {t.validUntil ? new Date(t.validUntil).toLocaleDateString("tr-TR") : "-"}
              </td>
              <td className="px-6 py-4 text-right">
                <Link href={`/yonetim/teklifler/${t.id}`} className="text-primary hover:underline font-medium">
                  Detay
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
