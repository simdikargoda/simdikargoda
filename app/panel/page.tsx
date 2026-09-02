import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  Wallet,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { requireAuth } from "@/lib/guard";
import { getCustomerWithAccounts } from "@/lib/services/customer.service";
import { getBalanceTransactions } from "@/lib/services/finance/balance.service";
import { getCurrentAccountTransactions } from "@/lib/services/finance/current-account.service";
import { listShipments } from "@/lib/services/tracking/tracking.service";
import { listCustomerPrices } from "@/lib/services/pricing.service";
import { formatKurus } from "@/lib/money";

import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PanelDashboardPage() {
  const session = await requireAuth();

  if (!session.customerId) {
    if (session.role === "admin") {
      redirect("/api/auth/provision-admin");
    }
    redirect("/giris");
  }
  const customerId = session.customerId;

  const data = await getCustomerWithAccounts(customerId);

  const [shipments, prices, balanceTx, currentTx] = await Promise.all([
    listShipments({ customerId, limit: 100 }),
    listCustomerPrices(customerId),
    data.customer.type === "balance" ? getBalanceTransactions(customerId) : [],
    data.customer.type === "current_account" ? getCurrentAccountTransactions(customerId) : [],
  ]);

  const accountValue =
    data.customer.type === "balance"
      ? `₺${(data.balanceKurus / 100).toLocaleString("tr-TR")}`
      : `₺${(data.debitKurus / 100).toLocaleString("tr-TR")}`;

  const labelPrefix = data.customer.type === "balance" ? "Mevcut Bakiye" : "Cari Borç";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Müşteri Paneli"
        description="Hesabınız, gönderileriniz ve operasyon durumunuz"
        eyebrow={data.customer.type === "balance" ? "Bakiye Hesabı" : "Cari Hesap"}
        actions={
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <BadgeCheck className="h-3.5 w-3.5" />
              {data.customer.status === "active" ? "Aktif Hesap" : "Pasif Hesap"}
            </span>
            <Link
              href="/panel/kargo/yeni"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-primary-strong hover:shadow-lift active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Plus className="h-4 w-4" />
              Yeni Kargo
            </Link>
          </div>
        }
      />

      {/* KPI kartları */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={labelPrefix}
          value={accountValue}
          icon={Wallet}
          iconClassName="bg-success/10 text-success"
          hint={data.customer.type === "current_account" ? `Limit: ₺${(data.limitKurus / 100).toLocaleString("tr-TR")}` : undefined}
        />
        <StatCard
          label="Toplam Gönderi"
          value={String(shipments.length)}
          icon={Boxes}
        />
        <StatCard
          label="Aktif Fiyat"
          value={String(prices.length)}
          icon={PackageSearch}
          iconClassName="bg-amber/10 text-warning"
        />
        <StatCard
          label="Hareket Sayısı"
          value={String(balanceTx.length + currentTx.length)}
          icon={ReceiptText}
          iconClassName="bg-primary/10 text-primary"
        />
      </div>

      {/* Son gönderiler */}
      <div className="card-surface overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-panel-secondary px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Son Gönderiler</h3>
            <p className="mt-0.5 text-xs text-muted">En güncel 10 kargo kaydı</p>
          </div>
          <ShipmentStatusBadge status="in_transit" />
        </div>

        {shipments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Henüz gönderiniz bulunmuyor"
              description="Gönderi oluşturulduğunda listeniz burada görünecek."
              icon={Boxes}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-panel-secondary text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Takip No</th>
                  <th className="px-5 py-3 font-medium">Firma</th>
                  <th className="px-5 py-3 font-medium">Alıcı</th>
                  <th className="px-5 py-3 font-medium">Ücret</th>
                  <th className="px-5 py-3 text-right font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {shipments.slice(0, 10).map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-panel-secondary last:border-0 hover:bg-panel-secondary/40"
                  >
                    <td className="px-5 py-3 font-semibold text-foreground">
                      {s.trackingNumber ?? "—"}
                    </td>
                    <td className="px-5 py-3 capitalize text-muted">{s.provider}</td>
                    <td className="px-5 py-3 text-muted">{s.receiverName}</td>
                    <td className="px-5 py-3 text-muted">
                      ₺{(s.salePriceKurus / 100).toLocaleString("tr-TR")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ShipmentStatusBadge status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alt bilgi şeridi */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-panel-secondary bg-white/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-sm text-muted">
          <CircleDollarSign className="h-4 w-4 text-primary" />
          <span>
            Fiyatlandırma ve detaylı dökümler ilgili bölümlerde listelenir.
            {data.customer.type === "balance" ? formatKurus(data.balanceKurus) : ""}
          </span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted/70">
          Kargo Operasyon Platformu
        </span>
      </div>
    </div>
  );
}
