import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Webhook yapılandırma bilgisi: Kargo webhook callback endpoint'i
 * sunulur; event işleme /yonetim/kargo üzerinden takip edilir.
 * Secret tarayıcıya yansıtılmaz.
 */
export default async function WebhooklarPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Webhooklar"
        description="Kargo firması durum callback endpoint'leri"
      />
      <div className="card-surface rounded-2xl border border-panel-secondary p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Callback Endpoint</h3>
        <p className="text-sm text-muted">
          Kargo firması destekliyorsa aşağıdaki URL, firma portalında
          ilgili firmanın hesabına callback olarak kaydedilir:
        </p>
        <pre className="mt-3 rounded-xl bg-panel-secondary/50 p-4 text-xs font-mono text-foreground">
          /api/webhooks/cargo/&lt;provider&gt;
        </pre>
        <p className="mt-4 text-sm text-muted">
          Webhook yalnızca resmi firma dokümanı ile paylaşılan secret imza
          doğrulaması etkinken işlenir. Provider HMAC desteklemesse webhook
          işlenmez.
        </p>
      </div>
    </div>
  );
}
