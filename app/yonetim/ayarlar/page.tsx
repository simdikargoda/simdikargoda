import { requireAdmin } from "@/lib/guard";
import { PageHeader } from "@/components/ui/page-header";
import { getAllProviderStatuses } from "@/lib/providers/cargo/registry";
import { netgsmConfigured } from "@/lib/services/notifications/netgsm.service";
import { CargoProviderBadge } from "@/components/ui/cargo-provider-badge";
import { StatusBadge, type StatusBadgeColor } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

export default async function AyarlarPage() {
  await requireAdmin();
  const providerStatuses = getAllProviderStatuses();
  const smsConfigured = netgsmConfigured();

  const integrationRows = [
    { key: "aras", configured: providerStatuses.aras.configured },
    { key: "dhl", configured: providerStatuses.dhl.configured },
    { key: "hepsijet", configured: providerStatuses.hepsijet.configured },
    { key: "ptt", configured: providerStatuses.ptt.configured },
    { key: "netgsm", configured: smsConfigured, label: "Netgsm SMS" },
  ];

  return (
    <div>
      <PageHeader title="Ayarlar" description="Sistem ve entegrasyon ayarları" />

      <div className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Entegrasyon Durumları</h3>
        <div className="space-y-3">
          {integrationRows.map((row) => {
            const key = row.key;
            const label = row.label ?? key;
            const statusColor: StatusBadgeColor = row.configured ? "green" : "slate";
            const statusLabel = row.configured ? "Aktif / Yapılandırılmış" : "Yapılandırılmadı";
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-panel-secondary bg-panel-secondary/30 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  {key !== "netgsm" ? <CargoProviderBadge provider={key} /> : null}
                  {key === "netgsm" ? (
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  ) : null}
                </div>
                <StatusBadge label={statusLabel} color={statusColor} />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          Entegrasyonlar config-driven çalışır: ilgili kargo firması / Netgsm secret'ları
          environment üzerinden girildiğinde (ve bağlantı testi başarılı olduğunda) aktifleşir.
          Secret değerleri burada plaintext gösterilmez.
        </p>
      </div>
    </div>
  );
}
