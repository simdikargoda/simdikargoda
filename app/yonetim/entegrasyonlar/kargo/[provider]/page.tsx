import { PageHeader } from "@/components/ui/page-header";
import { requireStaff } from "@/lib/guard";
import { getProviderConfig } from "@/lib/providers/cargo/registry";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  aras: "Aras Kargo",
  dhl: "DHL",
  hepsijet: "HepsiJET",
  ptt: "PTT Kargo",
};

/**
 * Kargo firması detay/entegrasyon durumu. Resmi API dokümanı temin edilene
 * kadar gerçek endpoint uydurulmaz; durum açıkça "Doküman Bekleniyor" gösterilir.
 */
export default async function KargoFirmasiPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  await requireStaff();
  const { provider } = await params;
  const label = LABELS[provider] ?? provider;
  const cfg = getProviderConfig(provider as "aras" | "dhl" | "hepsijet" | "ptt");

  return (
    <div className="space-y-6">
      <PageHeader title={label} description="Entegrasyon ve bağlantı durumu" />

      <div className="card-surface rounded-2xl border border-panel-secondary p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Bağlantı Durumu</h3>
        <div className="flex items-center gap-3">
          <span
            className={
              cfg.configured
                ? "inline-flex rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning"
                : "inline-flex rounded-full bg-panel-secondary px-2.5 py-1 text-xs font-semibold text-muted"
            }
          >
            {cfg.configured ? "Yapılandırıldı / Doküman Kontrolü" : "Doküman Bekleniyor"}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">
          {cfg.configured
            ? `${label} için production credential girildi; resmi API sözleşmesi doğrulanana kadar gerçek gönderi oluşturma etkinleştirilmez.`
            : `${label} için resmi API dokümanı ve production credential temin edilene kadar entegrasyon "Doküman Bekleniyor" durumundadır. Endpoint uydurulmaz.`}
        </p>
        {!cfg.configured && (
          <p className="mt-4 text-sm text-muted">
            Gerekli ortam değişkenleri:{" "}
            <code>{provider.toUpperCase()}_API_URL</code>,{" "}
            <code>{provider.toUpperCase()}_API_KEY</code>,{" "}
            <code>{provider.toUpperCase()}_API_SECRET</code>.
          </p>
        )}
      </div>
    </div>
  );
}
