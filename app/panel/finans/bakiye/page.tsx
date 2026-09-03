import { PageHeader } from "@/components/ui/page-header";
import { Banknote, ArrowLeft, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { requireAuth, assertCustomerScope } from "@/lib/guard";
import { getBalance, getBalanceTransactions } from "@/lib/services/finance/balance.service";
import { formatKurus } from "@/lib/money";

export const metadata = {
  title: "Bakiye İşlemleri | Kargo Ops",
};

export default async function BakiyePage() {
  const session = await requireAuth();
  
  if (!session.customerId) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Hata" description="Bu işlem için müşteri kaydınız bulunmuyor." />
      </div>
    );
  }

  assertCustomerScope(session.customerId, session);

  const balanceKurus = await getBalance(session.customerId);
  const transactions = await getBalanceTransactions(session.customerId);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground mb-4 transition">
        <ArrowLeft className="h-4 w-4" />
        Panele Dön
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <PageHeader
          title="Bakiye İşlemleri"
          description="Hesabınıza bakiye yükleyebilir ve finansal geçmişinizi görebilirsiniz."
        />
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 py-2 bg-white border border-panel-secondary rounded-xl shadow-sm">
            <span className="text-xs text-muted font-medium uppercase tracking-wider">Mevcut Bakiye</span>
            <span className="text-lg font-bold text-foreground">{formatKurus(balanceKurus)}</span>
          </div>
          <Link
            href="/panel/finans/bakiye/yukle"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition"
          >
            Bakiye Yükle
          </Link>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-foreground">İşlem Geçmişi</h3>
        {transactions.length > 0 ? (
          <div className="rounded-[24px] border border-panel-secondary bg-white shadow-soft overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-panel-secondary bg-panel">
                <tr>
                  <th className="px-6 py-4 font-semibold text-muted">İşlem Tarihi</th>
                  <th className="px-6 py-4 font-semibold text-muted">Tür</th>
                  <th className="px-6 py-4 font-semibold text-muted">Açıklama</th>
                  <th className="px-6 py-4 font-semibold text-muted text-right">Tutar</th>
                  <th className="px-6 py-4 font-semibold text-muted text-right">Kalan Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {transactions.map((tx) => {
                  const isPositive = tx.amountKurus > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-panel transition-colors">
                      <td className="px-6 py-4 text-muted text-xs">
                        {new Date(tx.createdAt).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          tx.type === 'deposit' || tx.type === 'refund' || tx.type === 'admin_credit' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : tx.type === 'shipment_fee' || tx.type === 'cancel'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {tx.type === 'deposit' ? 'Yükleme' :
                           tx.type === 'shipment_fee' ? 'Kargo Ücreti' :
                           tx.type === 'refund' ? 'İade' :
                           tx.type === 'admin_credit' ? 'Yönetici Eklemesi' :
                           tx.type === 'cancel' ? 'İptal Kesintisi' : 'Düzeltme'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate" title={tx.description || "-"}>
                        {tx.description || "-"}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{formatKurus(tx.amountKurus)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-muted">
                        {formatKurus(tx.balanceAfterKurus)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Banknote}
            title="Bakiye işlemi bulunamadı"
            description="Geçmişe dönük finansal hareketleriniz burada listelenecektir."
          />
        )}
      </div>
    </div>
  );
}
