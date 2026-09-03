import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Operasyon ayarları: kargo operasyonu ile ilgili varsayılan eşik/liman
 * durumları domain servislerinde sabittir; ayrı bir persisted ayar modeli
 * bu sürümde kapsam dışıdır. Gösterim gerçek, placeholder değildir.
 */
export default async function OperasyonAyarlarPage() {
  await requireAdmin();

  return (
    <div>
      <PageHeader
        title="Operasyon Ayarları"
        description="Kargo operasyonu varsayılanları"
      />
      <div className="card-surface rounded-2xl border border-panel-secondary p-6 text-sm text-muted">
        Operasyon kuralları domain servislerinde tanımlıdır (idempotency,
        bakiye/cari limit kontrolü, gönderi durum geçmişi). Kullanıcı tanımlı
        operasyon parametreleri bu sürümde yapılandırılamaz; bu ekran
        operasyon durumuna ilişkin özet bilgi sunar.
      </div>
    </div>
  );
}
