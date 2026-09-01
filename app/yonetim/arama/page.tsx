import Link from "next/link";
import { ArrowRight, Package, Users } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireStaff } from "@/lib/guard";
import { listShipments } from "@/lib/services/tracking/tracking.service";
import { getCustomers } from "@/lib/queries/customer.queries";

export const dynamic = "force-dynamic";

/**
 * Global arama: permission-aware, server-side. Müşteri, gönderi/takip no ve
 * alıcı alanlarında arama yapar. Fake/placeholder sonuç üretmez.
 */
export default async function AramaSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const { q = "" } = await searchParams;
  const query = q.trim();

  if (!query) {
    return (
      <div className="space-y-6">
        <PageHeader title="Global Arama" description="Müşteri, kargo ve takip numarası arayın" />
        <EmptyState title="Arama yapın" description="Yukarıdaki arama çubuğundan sorgu girin." />
      </div>
    );
  }

  const [shipments, customers] = await Promise.all([
    listShipments({ q: query, limit: 25 }),
    getCustomers(),
  ]);

  const matchedCustomers = customers.filter((c) => {
    const haystack = `${c.name} ${c.email} ${c.phone}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`"${query}" için Arama Sonuçları`}
        description="Müşteri, kargo veya takip numarası eşleşmeleri"
      />

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Gönderiler ({shipments.length})
        </div>
        {shipments.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">Eşleşen gönderi yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Takip No</th>
                  <th className="px-4 py-3 font-medium">Alıcı</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {shipments.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {s.trackingNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{s.receiverName}</td>
                    <td className="px-4 py-3 text-muted">{s.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/yonetim/kargo/${s.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-panel-secondary p-2 text-muted transition hover:bg-primary/10 hover:text-primary"
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

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> Müşteriler ({matchedCustomers.length})
        </div>
        {matchedCustomers.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">Eşleşen müşteri yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">E-posta</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {matchedCustomers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-muted">{c.email}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/yonetim/musteriler/${c.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-panel-secondary p-2 text-muted transition hover:bg-primary/10 hover:text-primary"
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
    </div>
  );
}
