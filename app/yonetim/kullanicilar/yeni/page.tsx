import { PageHeader } from "@/components/ui/page-header";
import { requireAdmin } from "@/lib/guard";
import { NewUserForm } from "./new-user-form";

export const dynamic = "force-dynamic";

export default async function YeniKullaniciOlusturPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 fade-in-up">
      <PageHeader
        title="Yeni Kullanıcı Oluştur"
        description="Sisteme yeni bir yönetici veya müşteri ekleyin"
      />
      
      <NewUserForm />
    </div>
  );
}
