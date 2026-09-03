import { PageHeader } from "@/components/ui/page-header";
import { getShipmentById, getShipmentStatusHistory } from "@/lib/queries/shipment.queries";
import { requireAdmin } from "@/lib/guard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, Truck, User, MapPin } from "lucide-react";
import { formatKurus } from "@/lib/money";

export const metadata = {
  title: "Gönderi Detayı | Kargo Ops",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KargoDetayPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const shipment = await getShipmentById(id);

  if (!shipment) {
    notFound();
  }

  const history = await getShipmentStatusHistory(id);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gönderi Detayı" 
          description={`${shipment.trackingNumber || shipment.barcode || 'Takip No Yok'} numaralı gönderi detayları.`} 
        />
        <Link
          href="/yonetim/kargo"
          className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kargolara Dön
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Gönderi Bilgileri */}
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Box className="h-5 w-5 text-primary" />
              Paket Bilgileri
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted">Firma</p>
                <p className="font-medium text-foreground uppercase">{shipment.provider}</p>
              </div>
              <div>
                <p className="text-muted">Durum</p>
                <p className="font-medium text-foreground">{shipment.status}</p>
              </div>
              <div>
                <p className="text-muted">Desi / Ağırlık</p>
                <p className="font-medium text-foreground">{shipment.desi} Desi / {shipment.weight} Kg</p>
              </div>
              <div>
                <p className="text-muted">Paket Adedi</p>
                <p className="font-medium text-foreground">{shipment.packageCount} Adet</p>
              </div>
              <div>
                <p className="text-muted">Oluşturulma</p>
                <p className="font-medium text-foreground">{new Date(shipment.createdAt).toLocaleString("tr-TR")}</p>
              </div>
              <div>
                <p className="text-muted">Ücret</p>
                <p className="font-medium text-foreground">{formatKurus(shipment.salePriceKurus)}</p>
              </div>
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <User className="h-5 w-5 text-primary" />
                Gönderici
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">{shipment.senderName}</p>
                <p className="text-muted">{shipment.senderPhone}</p>
                <p className="text-muted mt-2">{shipment.senderAddress}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Alıcı
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">{shipment.receiverName}</p>
                <p className="text-muted">{shipment.receiverPhone}</p>
                <p className="text-muted mt-2">{shipment.receiverAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hareket Geçmişi */}
        <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft h-fit">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Truck className="h-5 w-5 text-primary" />
            Hareket Geçmişi
          </h3>
          {history.length > 0 ? (
            <div className="relative border-l border-panel-secondary ml-3 space-y-6">
              {history.map((h, i) => (
                <div key={h.id} className="relative pl-6">
                  <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white" />
                  <p className="text-sm font-semibold text-foreground">{h.toStatus}</p>
                  <p className="text-xs text-muted">{new Date(h.createdAt).toLocaleString("tr-TR")}</p>
                  {h.note && <p className="mt-1 text-xs text-muted">{h.note}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Henüz hareket kaydı bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  );
}
