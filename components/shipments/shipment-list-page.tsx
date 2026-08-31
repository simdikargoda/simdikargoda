import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { listShipments } from "@/lib/services/tracking/tracking.service";

export const dynamic = "force-dynamic";

/**
 * Ortak gönderi listesi sayfası. Status filtresi bir REST/DB sorgusuna
 * eşlenir; her alt rota için duplicate shipment logic barındırmaz.
 */
export default async function ShipmentListPage({
  title,
  description,
  status,
  emptyTitle = "Gönderi bulunamadı",
}: {
  title: string;
  description: string;
  status?: string;
  emptyTitle?: string;
}) {
  const shipments = await listShipments({
    status,
    limit: 100,
  });

  return (
    <div>
      <PageHeader title={title} description={description} />

      {shipments.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description="Bu filtreyle eşleşen gönderi bulunamadı."
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
                  <td className="px-4 py-3 text-muted text-right font-mono">
                    {formatKurus(s.salePriceKurus)}
                  </td>
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
