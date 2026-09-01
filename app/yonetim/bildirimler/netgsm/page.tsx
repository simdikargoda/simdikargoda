import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireStaff } from "@/lib/guard";
import { netgsmConfigured } from "@/lib/services/notifications/netgsm.service";
import { NetgsmForm } from "./netgsm-form";

export const dynamic = "force-dynamic";

/** Netgsm ayarları: yapılandırma durumunu gerçek env config üzerinden gösterir. */
export default async function NetgsmAyarlarPage() {
  await requireStaff();
  const configured = netgsmConfigured();

  return (
    <div className="space-y-6 fade-in-up">
      <PageHeader
        title="Netgsm Ayarları"
        description="SMS sağlayıcı yapılandırma durumu"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Yapılandırma Durumu"
          value={configured ? "Yapılandırıldı" : "Yapılandırılmadı"}
          hint={
            configured
              ? "NETGSM_USERCODE / PASSWORD / HEADER tanımlı."
              : "SMS gönderimi için NETGSM_USERCODE, NETGSM_PASSWORD ve NETGSM_HEADER gerekli."
          }
        />
      </div>
      
      {!configured && <NetgsmForm />}

      <div className="card-surface rounded-2xl border border-panel-secondary p-6 mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Gerekli Değişkenler</h3>
        <ul className="space-y-2 text-sm text-muted">
          <li><code>NETGSM_USERCODE</code> — Netgsm kullanıcı adı</li>
          <li><code>NETGSM_PASSWORD</code> — Netgsm şifresi</li>
          <li><code>NETGSM_HEADER</code> — Gönderen başlığı</li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Bu değerler sunucu tarafı ortam değişkenlerinde (<code>.env.local</code>) tutulur ve asla tarayıcıya gönderilmez.
        </p>
      </div>
    </div>
  );
}
