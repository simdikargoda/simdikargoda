import { PageHeader } from "@/components/ui/page-header";
import { Search, UserPlus, Users, Edit, Shield } from "lucide-react";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { desc, ne } from "drizzle-orm";
import Link from "next/link";
import { requireStaff } from "@/lib/guard";

export const metadata = {
  title: "Sistem Kullanıcıları | Şimdi Kargoda",
};

export default async function KullanicilarPage() {
  await requireStaff();
  const db = getDb();
  
  // Sadece müşteri olmayan (sistem) kullanıcılarını çek
  const dbUsers = await db
    .select()
    .from(users)
    .where(ne(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 border border-rose-200"><Shield className="h-3 w-3" /> Sistem Yöneticisi</span>;

      default:
        return <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">Müşteri</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Aktif</span>;
    }
    return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50"><span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span> Pasif</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Sistem Kullanıcıları"
          description="Panele erişim yetkisi olan personeller"
        />
        <Link href="/yonetim/kullanicilar/yeni" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-all hover:bg-primary/90 shadow-soft">
          <UserPlus className="h-4 w-4" /> Yeni Kullanıcı Ekle
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-panel-secondary bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="İsim, e-posta veya rol ara..."
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-panel-secondary bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-panel-secondary bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Ad Soyad</th>
                <th className="px-6 py-4 font-semibold">E-posta</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Kayıt Tarihi</th>
                <th className="px-6 py-4 font-semibold">Durum</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {dbUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50">
                        <Users className="h-6 w-6" />
                      </div>
                      <p className="text-base font-medium text-foreground">Kullanıcı Bulunamadı</p>
                      <p className="text-sm">Sisteme kayıtlı herhangi bir personel bulunmuyor.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dbUsers.map((u) => (
                  <tr key={u.id} className="group hover:bg-panel-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full border border-panel-secondary shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary text-xs font-bold text-white">
                              {u.name.substring(0,2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(u.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/yonetim/kullanicilar/${u.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:bg-white hover:text-primary hover:shadow-sm transition-all border border-transparent hover:border-panel-secondary" title="Düzenle">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
