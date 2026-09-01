import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { getCriticalBalanceAccounts } from "@/lib/queries/finance.queries";

export const dynamic = "force-dynamic";

/**
 * Kritik bakiyeler: bakiyesi eşiğin altında olan ön ödemeli hesaplar ile
 * kullanılabilir limiti tükenen (veya negatif) cari hesaplar. Eşik domain
 * kuralıdır; varsayılan 0 kuruş, savunma değeri üzerinden kullanılır.
 */
export default async function CriticalBalancePage() {
  const { low, criticalCari } = await getCriticalBalanceAccounts(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kritik Bakiyeler"
        description="Bakiyesi tükenen veya kullanılabilir limiti kalmayan hesaplar"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Kritik Bakiye" value={String(low.length)} />
        <StatCard label="Kritik Cari" value={String(criticalCari.length)} />
        <StatCard
          label="Kullanılabilir Limit"
          value="Aşağıda"
          hint="Eşiği aşan hesaplar listelenir"
        />
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Kritik Bakiye Hesapları
        </div>
        {low.length === 0 ? (
          <EmptyState title="Kritik hesaplar yok" description="Tüm bakiyeler eşiğin üstünde." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium text-right">Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {low.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">{a.customerName}</td>
                    <td className="px-4 py-3 text-right font-mono text-danger">
                      {formatKurus(a.balanceKurus)}
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
          Kritik Cari Hesaplar (Kullanılabilir Limit)
        </div>
        {criticalCari.length === 0 ? (
          <EmptyState title="Kritik cari yok" description="Tüm cari hesaplarda kullanılabilir limit var." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium text-right">Borç</th>
                  <th className="px-4 py-3 font-medium text-right">Limit</th>
                  <th className="px-4 py-3 font-medium text-right">Kullanılabilir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {criticalCari.map((a) => (
                  <tr key={a.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">{a.customerName}</td>
                    <td className="px-4 py-3 text-right font-mono text-danger">
                      {formatKurus(a.debitKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {formatKurus(a.limitKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-danger">
                      {formatKurus(a.limitKurus - a.debitKurus)}
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
