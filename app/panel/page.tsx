import { redirect } from "next/navigation";
import {
  BadgeCheck,
  Boxes,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  Wallet,
  Plus,
  ChevronRight,
  PackagePlus,
  Crosshair,
  Banknote,
  Tags,
  ShieldCheck,
  Lock,
  UserCheck,
  Database,
  Box,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { requireAuth } from "@/lib/guard";
import { getCustomerWithAccounts } from "@/lib/services/customer.service";
import { getBalanceTransactions } from "@/lib/services/finance/balance.service";
import { getCurrentAccountTransactions } from "@/lib/services/finance/current-account.service";
import { listShipments } from "@/lib/services/tracking/tracking.service";
import { listCustomerPrices } from "@/lib/services/pricing.service";
import { formatKurus } from "@/lib/money";

import { ShipmentStatusBadge } from "@/components/ui/shipment-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusDonutChart, StatusChartDatum } from "@/components/widgets/status-donut-chart";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; color: string }> = {
  created: { label: "Oluşturuldu", color: "#64748B" }, // slate-500
  in_transit: { label: "Transferde", color: "#3B82F6" }, // blue-500
  delivered: { label: "Teslim Edilen", color: "#10B981" }, // emerald-500
  pending: { label: "Bekleyen", color: "#F59E0B" }, // amber-500
  issue: { label: "Sorunlu", color: "#EF4444" }, // red-500
  returned: { label: "İade", color: "#F97316" }, // orange-500
  cancelled: { label: "İptal", color: "#94A3B8" }, // slate-400
};

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

  // Calculate shipment status distribution
  const statusCounts = shipments.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData: StatusChartDatum[] = Object.entries(statusCounts)
    .map(([status, count]) => {
      const meta = STATUS_META[status] || { label: status, color: "#94A3B8" };
      return {
        key: status,
        label: meta.label,
        value: count,
        color: meta.color,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Müşteri Paneli"
        description="Hesabınız, gönderileriniz ve operasyon durumunuz"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success"></span>
              {data.customer.status === "active" ? "Aktif Hesap" : "Pasif Hesap"}
            </span>
            <div className="hidden sm:block h-6 w-px bg-panel-secondary"></div>
            <Link
              href="/panel/kargo/yeni"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-primary-strong hover:shadow-lift active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Plus className="h-4 w-4" />
              Yeni Kargo
            </Link>
          </div>
        }
      />

      {/* KPI Kartları - Üst Sıra */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bakiye Kartı */}
        <Link href="/panel/finans/bakiye" className="card-surface group flex items-center justify-between rounded-2xl px-5 py-4 transition hover:shadow-md cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition group-hover:scale-105">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted">Mevcut Bakiye</span>
              <span className="mt-1 text-lg font-bold tracking-tight text-foreground">{accountValue}</span>
              <span className="mt-0.5 text-[10px] text-muted">Kullanılabilir bakiye</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        {/* Gönderi Kartı */}
        <Link href="/panel/kargo" className="card-surface group flex items-center justify-between rounded-2xl px-5 py-4 transition hover:shadow-md cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition group-hover:scale-105">
              <Box className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted">Toplam Gönderi</span>
              <span className="mt-1 text-lg font-bold tracking-tight text-foreground">{shipments.length}</span>
              <span className="mt-0.5 text-[10px] text-muted">Tüm zamanlar</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        {/* Fiyat Kartı */}
        <Link href="/panel/fiyatlandirma" className="card-surface group flex items-center justify-between rounded-2xl px-5 py-4 transition hover:shadow-md cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition group-hover:scale-105">
              <Tags className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted">Aktif Fiyat</span>
              <span className="mt-1 text-lg font-bold tracking-tight text-foreground">{prices.length}</span>
              <span className="mt-0.5 text-[10px] text-muted">Geçerli fiyat listesi</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>

        {/* Hareket Kartı */}
        <Link href="/panel/finans/bakiye" className="card-surface group flex items-center justify-between rounded-2xl px-5 py-4 transition hover:shadow-md cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:scale-105">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted">Hareket Sayısı</span>
              <span className="mt-1 text-lg font-bold tracking-tight text-foreground">{balanceTx.length + currentTx.length}</span>
              <span className="mt-0.5 text-[10px] text-muted">Hesap dökümü</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
        </Link>
      </div>

      {/* Ana Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Sol Kolon - Son Gönderiler */}
        <div className="lg:col-span-2">
          <div className="card-surface flex h-full flex-col overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="text-base font-bold text-foreground">Son Gönderiler</h3>
                <p className="mt-1 text-xs text-muted">En güncel 10 kargo kaydı</p>
              </div>
              <Link
                href="/panel/kargo"
                className="flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-strong"
              >
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex-1">
              {shipments.length === 0 ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-8 text-center">
                  <img
                    src="/images/empty-state-box.png"
                    alt="Gönderi yok"
                    className="mb-4 h-36 w-36 object-contain"
                  />
                  <h4 className="text-lg font-semibold text-foreground">Henüz gönderiniz bulunmuyor</h4>
                  <p className="mt-2 max-w-sm text-sm text-muted">
                    İlk kargonuzu oluşturduğunuzda takip ve operasyon süreci burada görüntülenecek.
                  </p>
                  <Link
                    href="/panel/kargo/yeni"
                    className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-strong hover:shadow-lift"
                  >
                    <Plus className="h-4 w-4" />
                    İlk Kargonuzu Oluşturun
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-panel-secondary/50 bg-panel-secondary/10 text-left text-xs uppercase tracking-wider text-muted">
                        <th className="px-6 py-3 font-medium">Takip No</th>
                        <th className="px-6 py-3 font-medium">Firma</th>
                        <th className="px-6 py-3 font-medium">Alıcı</th>
                        <th className="px-6 py-3 text-right font-medium">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.slice(0, 10).map((s) => (
                        <tr
                          key={s.id}
                          className="group border-b border-panel-secondary/50 last:border-0 hover:bg-panel-secondary/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {s.trackingNumber ?? "—"}
                          </td>
                          <td className="px-6 py-4 capitalize text-muted">{s.provider}</td>
                          <td className="px-6 py-4 text-muted">{s.receiverName}</td>
                          <td className="px-6 py-4 text-right">
                            <ShipmentStatusBadge status={s.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Dağılım Grafiği */}
          <div className="card-surface flex flex-col rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Gönderi Durum Dağılımı</h3>
                <p className="mt-0.5 text-[11px] text-muted">Gönderilerinizin durumlara göre dağılımı</p>
              </div>
            </div>
            
            <div className="mt-2">
              <StatusDonutChart data={chartData} />
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="card-surface rounded-2xl p-6">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-foreground">Hızlı İşlemler</h3>
              <p className="mt-0.5 text-[11px] text-muted">Sık kullanılan işlemlere hızlı erişim</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/panel/kargo/yeni"
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-panel-secondary bg-panel p-4 transition hover:border-blue-200 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition group-hover:scale-110">
                  <PackagePlus className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">Yeni Kargo</span>
              </Link>
              
              <Link 
                href="/panel/kargo"
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-panel-secondary bg-panel p-4 transition hover:border-violet-200 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition group-hover:scale-110">
                  <Crosshair className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">Kargo Takibi</span>
              </Link>

              <Link 
                href="/panel/finans/bakiye"
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-panel-secondary bg-panel p-4 transition hover:border-emerald-200 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition group-hover:scale-110">
                  <Banknote className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">Bakiye Yükle</span>
              </Link>

              <Link 
                href="/panel/fiyatlandirma"
                className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-panel-secondary bg-panel p-4 transition hover:border-amber-200 hover:shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition group-hover:scale-110">
                  <Tags className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">Fiyat Listesi</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Güvenlik Bandı */}
      <div className="mt-6 mb-8 grid grid-cols-1 gap-6 rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Güvenli Bağlantı</h4>
            <p className="mt-0.5 text-[10px] text-muted">TLS 1.3 ile korunur</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Güvenli Oturum</h4>
            <p className="mt-0.5 text-[10px] text-muted">Oturumlar güvenle yönetilir</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white shadow-sm">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Yetkili Erişim</h4>
            <p className="mt-0.5 text-[10px] text-muted">Rol bazlı erişim kontrolü</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Veri Güvenliği</h4>
            <p className="mt-0.5 text-[10px] text-muted">Tüm verileriniz korunur</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-panel-secondary pt-6 pb-8 sm:flex-row">
        <p className="text-xs text-muted w-full text-center sm:text-left">
          © {new Date().getFullYear()} Kargo Operasyon Platformu. Tüm hakları saklıdır.
        </p>
      </footer>

    </div>
  );
}
