import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { formatKurus } from "@/lib/money";
import { getShipmentById, getShipmentStatusHistory } from "@/lib/queries/shipment.queries";
import { Package, MapPin, CalendarClock, User, RefreshCw, AlertCircle } from "lucide-react";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function KargoDetayPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const shipment = await getShipmentById(id);

  if (!shipment) {
    notFound();
  }

  const history = await getShipmentStatusHistory(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kargo Detayı"
        description={`${shipment.trackingNumber ?? "Takip No Yok"} - ${shipment.customerName}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol Sütun: Özet ve Adresler */}
        <div className="md:col-span-2 space-y-6">
          <div className="card-surface p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Gönderi Özeti
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted">Durum</p>
                <div className="mt-1">
                  <ShipmentStatusBadge status={shipment.status} />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted">Kargo Firması</p>
                <p className="font-medium text-foreground capitalize mt-1">{shipment.provider}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Paket Bilgisi</p>
                <p className="font-medium text-foreground mt-1">
                  {shipment.packageCount} Adet, {shipment.desi} Desi, {shipment.weight} KG
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Tutar (Satış)</p>
                <p className="font-medium text-foreground mt-1">{formatKurus(shipment.salePriceKurus)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card-surface p-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-muted" />
                Gönderici
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-foreground">{shipment.senderName}</span></p>
                <p className="text-muted">{shipment.senderPhone}</p>
                <p className="text-muted mt-2 leading-relaxed">{shipment.senderAddress}</p>
              </div>
            </div>

            <div className="card-surface p-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Alıcı
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-foreground">{shipment.receiverName}</span></p>
                <p className="text-muted">{shipment.receiverPhone}</p>
                <p className="text-muted mt-2 leading-relaxed">{shipment.receiverAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Sütun: Takip Geçmişi */}
        <div className="space-y-6">
          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                Takip Geçmişi
              </h3>
            </div>

            <div className="relative border-l border-panel-secondary ml-3 space-y-6">
              {history.map((h, i) => (
                <div key={h.id} className="relative pl-6">
                  <span
                    className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-panel ${
                      i === history.length - 1 ? "bg-primary" : "bg-panel-secondary"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      {h.toStatus}
                    </span>
                    <span className="text-xs text-muted mt-0.5">
                      {new Date(h.createdAt).toLocaleString("tr-TR")}
                    </span>
                    {h.note && (
                      <p className="text-sm text-foreground mt-2 bg-panel-secondary/20 p-2 rounded-lg">
                        {h.note}
                      </p>
                    )}
                    {h.providerStatus && (
                      <p className="text-[10px] text-muted font-mono mt-1">
                        API Durumu: {h.providerStatus}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="pl-6 text-sm text-muted flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Henüz bir durum geçmişi bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
