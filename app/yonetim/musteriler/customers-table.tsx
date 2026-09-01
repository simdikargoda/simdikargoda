"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useTransition } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import { deleteCustomerAction } from "./actions";

import type { customers } from "@/db/schema/customer";
import type { StatusBadgeColor } from "@/components/ui/status-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

type CustomerRow = typeof customers.$inferSelect;

const TYPE_META: Record<string, { label: string; color: StatusBadgeColor }> = {
  balance: { label: "Bakiyeli", color: "blue" },
  current_account: { label: "Cari", color: "amber" },
};

const STATUS_META: Record<string, { label: string; color: StatusBadgeColor }> = {
  active: { label: "Aktif", color: "green" },
  passive: { label: "Pasif", color: "slate" },
};

export function CustomersTable({
  customers,
  initialQ,
}: {
  customers: CustomerRow[];
  initialQ: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function applyQuery(name: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    startTransition(() => router.push(`/yonetim/musteriler?${next.toString()}`));
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    applyQuery("q", String(form.get("q") ?? "").trim());
  }

  return (
    <div className="rounded-2xl border border-panel-secondary bg-panel shadow-sm">
      {/* Filtre çubuğu */}
      <div className="flex flex-col gap-3 border-b border-panel-secondary p-4 sm:flex-row sm:items-center">
        <form onSubmit={onSearch} className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={initialQ}
            placeholder="Ad, e-posta, telefon ara..."
            className="w-full rounded-xl border border-panel-secondary bg-panel py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>
        <select
          aria-label="Tip filtresi"
          defaultValue={searchParams.get("tip") ?? ""}
          onChange={(e) => applyQuery("tip", e.target.value)}
          className="rounded-xl border border-panel-secondary bg-panel px-3 py-2 text-sm"
        >
          <option value="">Tüm Tipler</option>
          <option value="balance">Bakiyeli</option>
          <option value="current_account">Cari</option>
        </select>
        <select
          aria-label="Durum filtresi"
          defaultValue={searchParams.get("durum") ?? ""}
          onChange={(e) => applyQuery("durum", e.target.value)}
          className="rounded-xl border border-panel-secondary bg-panel px-3 py-2 text-sm"
        >
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
        </select>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-panel-secondary text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Yetkili</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Tip</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 text-right font-medium">Oluşturulma</th>
              <th className="px-4 py-3 text-right font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const type = TYPE_META[c.type];
              const status = STATUS_META[c.status];
              return (
                <tr
                  key={c.id}
                  className="border-b border-panel-secondary last:border-0 hover:bg-panel-secondary/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/yonetim/musteriler/${c.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.authorizedPerson ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={type.label} color={type.color} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={status.label} color={status.color} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted">
                    {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/yonetim/musteriler/${c.id}`}
                        className="p-1.5 text-muted hover:text-primary transition-colors rounded-lg hover:bg-panel-secondary"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteCustomerForm customerId={c.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {customers.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="Müşteri bulunamadı"
            description="Filtreleri değiştirin veya yeni bir müşteri ekleyin."
          />
        </div>
      ) : null}

      {isPending ? (
        <div className="border-t border-panel-secondary px-4 py-2 text-xs text-muted">
          Güncelleniyor...
        </div>
      ) : null}
    </div>
  );
}

function DeleteCustomerForm({ customerId }: { customerId: string }) {
  const [state, formAction, pending] = useActionState(deleteCustomerAction, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="customerId" value={customerId} />
      <button
        type="submit"
        disabled={pending}
        title="Sil"
        className="p-1.5 text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
