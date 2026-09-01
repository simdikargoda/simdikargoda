import { PageHeader } from "@/components/ui/page-header";
import { requireStaff } from "@/lib/guard";
import { netgsmConfigured } from "@/lib/services/notifications/netgsm.service";

export const dynamic = "force-dynamic";

/**
 * Bildirim ayarları ekranı. Gerçek SMS gönderim/template sistemi Netgsm
 * yapılandırmasına bağlıdır; durum ve yönlendirme gerçek config'e dayanır.
 * Bildirim ayarları ile SMS gönderimleri ayrı ekranlar değildir: bu sayfa
 * SMS gönderim/log yönetimine bağlanır (duplicate menü engellenir).
 */
export default async function BildirimAyarlarPage() {
  await requireStaff();
  const configured = netgsmConfigured();

  return (
    <div>
      <PageHeader
        title="Bildirim Ayarları"
        description={`SMS sağlayıcı durumu: ${configured ? "yapılandırıldı" : "yapılandırılmadı"}`}
      />
      <div className="card-surface rounded-2xl border border-panel-secondary p-6 text-sm text-muted">
        SMS gönderimlerini ve loglarını yönetmek için{" "}
        <a href="/yonetim/bildirimler/sms" className="text-primary hover:underline">
          SMS Gönderimleri
        </a>{" "}
        ekranını kullanın. Sağlayıcı yapılandırması{" "}
        <a href="/yonetim/bildirimler/netgsm" className="text-primary hover:underline">
          Netgsm Ayarları
        </a>{" "}
        sayfasında yapılır.
      </div>
    </div>
  );
}
