import { PageHeader } from "@/components/ui/page-header";
import { Tags, ArrowLeft, Box } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { requireAuth, assertCustomerScope } from "@/lib/guard";
import { getCustomerPrices } from "@/lib/queries/pricing.queries";
import { formatKurus } from "@/lib/money";

export const metadata = {
  title: "Fiyat Listesi | Kargo Ops",
};

export default async function FiyatlandirmaPage() {
  const session = await requireAuth();
  
  if (!session.customerId) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Hata" description="Bu işlem için müşteri kaydınız bulunmuyor." />
      </div>
    );
  }

  assertCustomerScope(session.customerId, session);
  const prices = await getCustomerPrices(session.customerId);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground mb-4 transition">
        <ArrowLeft className="h-4 w-4" />
        Panele Dön
      </Link>
      
      <div className="mb-8">
        <PageHeader
          title="Fiyat Listesi"
          description="Hesabınıza tanımlanmış aktif kargo fiyatlandırma tarifeleri."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prices.length > 0 ? (
          prices.map((p) => (
            <div key={p.id} className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft hover:border-amber-200 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Box className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground uppercase">{p.provider}</h3>
                  <p className="text-xs font-medium text-muted">
                    {p.type === 'fixed' ? 'Sabit Fiyat' : 
                     p.type === 'per_desi' ? 'Desi Başına' : 'Kilo Başına'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-panel-secondary pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted">Birim Fiyat</p>
                  <p className="text-xl font-bold text-foreground">{formatKurus(p.priceKurus)}</p>
                </div>
                {p.breakpoint != null && (
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-muted">Eşik Değeri</p>
                    <p className="text-sm font-semibold text-foreground">{p.breakpoint} {p.type === 'per_desi' ? 'Desi' : 'Kg'}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon={Tags}
              title="Özel Fiyatlandırma Bulunamadı"
              description="Hesabınıza henüz özel bir fiyatlandırma tarifesi tanımlanmamış. Varsayılan liste fiyatları geçerlidir."
            />
          </div>
        )}
      </div>
    </div>
  );
}
