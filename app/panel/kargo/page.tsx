import { PageHeader } from "@/components/ui/page-header";
import { Boxes, ArrowLeft, Truck, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { requireAuth, assertCustomerScope } from "@/lib/guard";
import { getShipmentsByCustomerId } from "@/lib/queries/shipment.queries";

export const metadata = {
  title: "Kargo Takibi | Kargo Ops",
};

export default async function KargoPage() {
  const session = await requireAuth();
  
  // Guard
  if (!session.customerId) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Hata" description="Bu işlem için müşteri kaydınız bulunmuyor." />
      </div>
    );
  }

  assertCustomerScope(session.customerId, session);

  const shipments = await getShipmentsByCustomerId(session.customerId);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground mb-4 transition">
        <ArrowLeft className="h-4 w-4" />
        Panele Dön
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Kargo Takibi"
          description="Gönderilerinizi görüntüleyin ve güncel durumlarını takip edin."
        />
        <Link
          href="/panel/kargo/yeni"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
        >
          Yeni Gönderi
        </Link>
      </div>

      <div className="mt-6">
        {shipments.length > 0 ? (
          <div className="rounded-[24px] border border-panel-secondary bg-white shadow-soft overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel">
                <tr>
                  <th className="px-6 py-4 font-semibold text-muted">Takip No / Barkod</th>
                  <th className="px-6 py-4 font-semibold text-muted">Firma</th>
                  <th className="px-6 py-4 font-semibold text-muted">Alıcı</th>
                  <th className="px-6 py-4 font-semibold text-muted">Durum</th>
                  <th className="px-6 py-4 font-semibold text-muted">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-panel transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {s.trackingNumber || s.barcode || "-"}
                    </td>
                    <td className="px-6 py-4 text-muted uppercase">
                      {s.provider}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {s.receiverName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        s.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                        s.status === 'issue' || s.status === 'returned' || s.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status === 'in_transit' && <Truck className="h-3 w-3" />}
                        {s.status === 'created' && <Clock className="h-3 w-3" />}
                        {s.status === 'delivered' ? 'Teslim Edildi' :
                         s.status === 'in_transit' ? 'Yolda' :
                         s.status === 'issue' ? 'Sorunlu' :
                         s.status === 'returned' ? 'İade Edildi' :
                         s.status === 'cancelled' ? 'İptal' : 'Oluşturuldu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs">
                      {new Date(s.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Boxes}
            title="Henüz gönderi yok"
            description="Gönderileriniz oluşturulduğunda burada listelenecektir."
          />
        )}
      </div>
    </div>
  );
}
