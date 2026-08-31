import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomers } from "@/lib/queries/customer.queries";

export const dynamic = "force-dynamic";

/**
 * Ortak müşteri listesi sayfası. Tip/durum filtresi DB'den gelir;
 * fake veri kullanılmaz.
 */
export default async function CustomerListPage({
  title,
  description,
  type,
  status,
}: {
  title: string;
  description: string;
  type?: "balance" | "current_account";
  status?: "active" | "passive";
}) {
  const customers = await getCustomers();
  const filtered = customers.filter(
    (c) =>
      (!type || c.type === type) &&
      (!status || c.status === status)
  );

  return (
    <div>
      <PageHeader title={title} description={description} />

      {filtered.length === 0 ? (
        <EmptyState
          title="Müşteri bulunamadı"
          description="Bu filtreyle eşleşen müşteri bulunamadı."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-panel-secondary bg-panel shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Müşteri</th>
                <th className="px-4 py-3 font-medium">E-posta</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Çalışma Modeli</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="group transition-colors hover:bg-panel-secondary/40"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{c.phone}</td>
                  <td className="px-4 py-3 capitalize text-muted">
                    {c.type === "balance" ? "Ön Ödemeli" : "Cari"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        c.status === "active"
                          ? "inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                          : "inline-flex rounded-full bg-panel-secondary px-2.5 py-1 text-xs font-semibold text-muted"
                      }
                    >
                      {c.status === "active" ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/yonetim/musteriler/${c.id}`}
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
