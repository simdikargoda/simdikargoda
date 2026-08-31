import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { formatKurus } from "@/lib/money";
import {
  getAllBalanceRequests,
  getAllBalanceTransactions,
} from "@/lib/queries/finance.queries";

export const dynamic = "force-dynamic";

/** Bakiye hareketleri + yükleme talepleri ekranı. */
export default async function BalanceTransactionsPage() {
  const [transactions, requests] = await Promise.all([
    getAllBalanceTransactions(100),
    getAllBalanceRequests(100),
  ]);

  const totalIn = transactions
    .filter((t) => t.amountKurus > 0)
    .reduce((s, t) => s + t.amountKurus, 0);
  const totalOut = transactions
    .filter((t) => t.amountKurus < 0)
    .reduce((s, t) => s + t.amountKurus, 0);
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bakiye Hareketleri"
        description="Bakiye ledger hareketleri ve havale (bakiye yükleme) talepleri"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Giriş" value={formatKurus(totalIn)} />
        <StatCard label="Toplam Çıkış" value={formatKurus(totalOut)} />
        <StatCard label="Bekleyen Yükleme" value={String(pendingRequests.length)} />
        <StatCard label="Toplam Hareket" value={String(transactions.length)} />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Bekleyen Bakiye Yükleme Talepleri
        </div>
        {pendingRequests.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            Bekleyen bakiye yükleme talebi bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Tutar</th>
                  <th className="px-4 py-3 font-medium">Banka Referansı</th>
                  <th className="px-4 py-3 font-medium">Not</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {pendingRequests.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {formatKurus(r.amountKurus)}
                    </td>
                    <td className="px-4 py-3 text-muted">{r.bankReference ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{r.note ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(r.createdAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Son Bakiye Hareketleri
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            title="Hareket bulunamadı"
            description="Henüz bakiye hareketi kaydedilmemiş."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Tip</th>
                  <th className="px-4 py-3 font-medium text-right">Tutar</th>
                  <th className="px-4 py-3 font-medium">Açıklama</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {transactions.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 capitalize text-muted">{t.type}</td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-medium ${
                        t.amountKurus >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {t.amountKurus >= 0 ? "+" : ""}
                      {formatKurus(t.amountKurus)}
                    </td>
                    <td className="px-4 py-3 text-muted">{t.description ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(t.createdAt).toLocaleString("tr-TR")}
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
