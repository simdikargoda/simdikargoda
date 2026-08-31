import { PageHeader } from "@/components/ui/page-header";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Yeni kullanıcı oluşturma akışı. Kullanıcı yönetimi güvenli auth tarafına
 * bağlıdır; bu sürümde yönetici kullanıcı oluşturma seed/migration ile
 * sağlanır. Form ekranı scope dışıdır; dead placeholder yerine bilgilendirici
 * durum gösterilir.
 */
export default async function YeniKullaniciOlusturPage() {
  await requireStaff();

  return (
    <div>
      <PageHeader
        title="Yeni Kullanıcı Oluştur"
        description="Sistem yöneticileri"
      />
      <div className="card-surface rounded-2xl border border-panel-secondary p-6 text-sm text-muted">
        Kullanıcı oluşturma, güvenli ortam değişkenleri ve production seed
        akışıyla yönetilir. Yönetici kullanıcılar{" "}
        <code>&quot;users&quot;</code> şemasına kaydedilir; bireysel kullanıcı
        ekleme bu sürümde doğrudan form ile yapılmaz.
      </div>
    </div>
  );
}
