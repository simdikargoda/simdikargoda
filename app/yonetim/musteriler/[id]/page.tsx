import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { requireStaff, assertCustomerScope } from "@/lib/guard";
import { PageHeader } from "@/components/ui/page-header";
import { getCustomerWithAccounts } from "@/lib/services/customer.service";
import { StatCard } from "@/components/ui/stat-card";
import { formatKurus } from "@/lib/money";
import type { StatusBadgeColor } from "@/components/ui/status-badge";
import { EditCustomerForm } from "./edit-customer-form";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; color: StatusBadgeColor }> = {
  balance: { label: "Bakiyeli", color: "blue" },
  current_account: { label: "Cari", color: "amber" },
};

const STATUS_META: Record<string, { label: string; color: StatusBadgeColor }> = {
  active: { label: "Aktif", color: "green" },
  passive: { label: "Pasif", color: "slate" },
};

export default async function MusteriDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaff();
  const { id } = await params;
  assertCustomerScope(id, session);

  let data;
  try {
    data = await getCustomerWithAccounts(id);
  } catch {
    notFound();
  }

  const { customer } = data;
  const type = TYPE_META[customer.type];
  const status = STATUS_META[customer.status];

  return (
    <div>
      <Link
        href="/yonetim/musteriler"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Müşteriler
      </Link>

      <PageHeader
        title={customer.name}
        description={`${customer.authorizedPerson ?? customer.name} • ${customer.email}`}
      />

      {/* Üst özet */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tip" value={type.label} />
        <StatCard label="Durum" value={status.label} />
        {customer.type === "balance" ? (
          <StatCard label="Mevcut Bakiye" value={formatKurus(data.balanceKurus)} />
        ) : (
          <>
            <StatCard label="Cari Borç" value={formatKurus(data.debitKurus)} />
            <StatCard label="Cari Limit" value={formatKurus(data.limitKurus)} />
          </>
        )}
      </div>

      <div className="mb-6">
        <EditCustomerForm customer={customer} />
      </div>

      <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">İletişim & Adres</h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-muted">Telefon</dt>
            <dd className="mt-0.5 text-foreground">{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">E-posta</dt>
            <dd className="mt-0.5 text-foreground">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Vergi Dairesi</dt>
            <dd className="mt-0.5 text-foreground">{customer.taxOffice ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Vergi No</dt>
            <dd className="mt-0.5 text-foreground">{customer.taxNumber ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Şehir / İlçe</dt>
            <dd className="mt-0.5 text-foreground">
              {customer.city ?? "—"} {customer.district ? `/${customer.district}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Adres</dt>
            <dd className="mt-0.5 text-foreground">{customer.address ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-sm text-muted">
        Kargo, bakiye/cari hareketleri, tahsilat ve fiyatlandırma sekmeleri ilgili
        fazlarda (FAZ 3, 4, 6) buraya bağlanacak.
      </p>
    </div>
  );
}

