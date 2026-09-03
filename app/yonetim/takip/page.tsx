import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/guard";
import { getShipmentById } from "@/lib/queries/shipment.queries";
import { getShipmentStatusHistory } from "@/lib/queries/shipment.queries";

export const dynamic = "force-dynamic";

/**
 * Kargo takip: gerçek kayıtlı shipment + persisted status history.
 * Provider polling/webhook için gerçek dış API contract'ı resmi olarak
 * temin edilene kadar polling etkinleştirilmez (endpoint uydurulmaz).
 * Bu ekran takip numarasına göre gerçek iç kayıt tarihçesini gösterir.
 */
export default async function TakipPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  await requireAdmin();
  const { no = "" } = await searchParams;
  const trackingNo = no.trim();

  let shipment = null;
  let history: Awaited<ReturnType<typeof getShipmentStatusHistory>> = [];

  if (trackingNo) {
    const lookup = await import("@/lib/services/tracking/tracking.service");
    const results = await lookup.listShipments({ q: trackingNo, limit: 10 });
    const found = results.find((s) => s.trackingNumber?.toLowerCase() === trackingNo.toLowerCase());
    if (found) {
      shipment = await getShipmentById(found.id);
      history = await getShipmentStatusHistory(found.id);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kargo Takip"
        description="Gönderinin iç durumu ve takip geçmişi"
      />

      <form className="flex max-w-2xl gap-3">
        <input
          name="no"
          defaultValue={trackingNo}
          className="block w-full rounded-xl border border-panel-secondary bg-white px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Takip Numarası Girin..."
        />
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary/90"
        >
          Sorgula
        </button>
      </form>

      {trackingNo && !shipment && (
        <EmptyState
          title="Kargo bulunamadı"
          description={`"${trackingNo}" takip numarasına ait kayıtlı gönderi bulunamadı.`}
        />
      )}

      {shipment && (
        <div className="card-surface rounded-2xl border border-panel-secondary p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Gönderi: {shipment.trackingNumber ?? "—"}
            <span className="ml-2 text-xs text-muted capitalize">({shipment.provider})</span>
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-muted">Henüz durum geçmişi bulunmuyor.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="text-sm text-muted">
                  <span className="font-medium text-foreground">{h.toStatus}</span>
                  <span className="mx-2">·</span>
                  {new Date(h.createdAt).toLocaleString("tr-TR")}
                  {h.note ? <span className="block text-xs">{h.note}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
