import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { formatKurus } from "@/lib/money";
import {
  getAllCollections,
  getAllCurrentAccountTransactions,
} from "@/lib/queries/finance.queries";

export const dynamic = "force-dynamic";

/** Cari tahsilat ve cari hareketler ekranı. */
export default async function CurrentAccountTransactionsPage() {
  const [collections, transactions] = await Promise.all([
    getAllCollections(100),
    getAllCurrentAccountTransactions(100),
  ]);

  const totalCollected = collections
    .filter((c) => c.status === "received")
    .reduce((s, c) => s + c.amountKurus, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cari Hareketler"
        description="Cari hesapların tahsilat ve borç/hareket geçmişi"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Toplam Tahsilat" value={formatKurus(totalCollected)} />
        <StatCard label="Tahsilat Sayısı" value={String(collections.length)} />
        <StatCard label="Toplam Hareket" value={String(transactions.length)} />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Tahsilatlar
        </div>
        {collections.length === 0 ? (
          <EmptyState
            title="Tahsilat bulunamadı"
            description="Henüz tahsilat kaydı bulunmuyor."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium text-right">Tutar</th>
                  <th className="px-4 py-3 font-medium">Yöntem</th>
                  <th className="px-4 py-3 font-medium">Not</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {collections.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 text-right font-mono font-medium text-success">
                      {formatKurus(c.amountKurus)}
                    </td>
                    <td className="px-4 py-3 text-muted">{c.method ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{c.note ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          c.status === "received"
                            ? "inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                            : "inline-flex rounded-full bg-panel-secondary px-2.5 py-1 text-xs font-semibold text-muted"
                        }
                      >
                        {c.status === "received" ? "Tahsil Edildi" : "İptal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(c.collectedAt).toLocaleString("tr-TR")}
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
          Cari Hareketler (Ledger)
        </div>
        {transactions.length === 0 ? (
          <EmptyState
            title="Hareket bulunamadı"
            description="Henüz cari hareketi kaydedilmemiş."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Tip</th>
                  <th className="px-4 py-3 font-medium text-right">Tutar</th>
                  <th className="px-4 py-3 font-medium text-right">Borç (son)</th>
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
                        t.amountKurus >= 0 ? "text-danger" : "text-success"
                      }`}
                    >
                      {t.amountKurus >= 0 ? "+" : ""}
                      {formatKurus(t.amountKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {formatKurus(t.debitAfterKurus)}
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
