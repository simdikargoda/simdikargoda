import { PageHeader } from "@/components/ui/page-header";
import { listShipments } from "@/lib/services/tracking/tracking.service";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { requireAdmin } from "@/lib/guard";
import { NewShipmentButton } from "./new-shipment-button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KargoPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const shipments = await listShipments({
    status: params.status,
    q: params.q,
    limit: 100,
  });

  return (
    <div>
      <PageHeader
        title="Kargo İşlemleri"
        description="Gönderileri listele, oluştur ve takip et"
        actions={<NewShipmentButton />}
      />

      {shipments.length === 0 ? (
        <EmptyState
          title="Gönderi bulunamadı"
          description="Yeni bir kargo oluşturun veya filtrenizi değiştirin."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-panel-secondary bg-panel shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Takip No</th>
                <th className="px-4 py-3 font-medium">Firma</th>
                <th className="px-4 py-3 font-medium">Alıcı</th>
                <th className="px-4 py-3 font-medium text-right">Ücret</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {shipments.map((s) => (
                <tr
                  key={s.id}
                  className="group transition-colors hover:bg-panel-secondary/40"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {s.trackingNumber ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{s.provider}</td>
                  <td className="px-4 py-3 text-muted">{s.receiverName}</td>
                  <td className="px-4 py-3 text-muted text-right font-mono">{formatKurus(s.salePriceKurus)}</td>
                  <td className="px-4 py-3">
                    <ShipmentStatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/yonetim/kargo/${s.id}`}
                      className="inline-flex items-center justify-center rounded-lg bg-panel-secondary p-2 text-muted transition hover:bg-primary/10 hover:text-primary"
                      title="Detaylara git"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
