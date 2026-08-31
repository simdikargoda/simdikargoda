import { PageHeader } from "@/components/ui/page-header";
import { ShieldCheck, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { sql } from "drizzle-orm";

export const metadata = {
  title: "Roller & Yetkiler | Şimdi Kargoda",
};

export default async function RollerPage() {
  const db = getDb();
  
  // Veritabanından her role ait kullanıcı sayısını çek
  const stats = await db
    .select({
      role: users.role,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(users.role);

  // Rollerin ekrandaki görünümü için bir map
  const roleMap: Record<string, { title: string, level: string, color: string }> = {
    admin: { title: "Sistem Yöneticisi", level: "Tam Yetki (Level 1)", color: "text-rose-500 bg-rose-50 border-rose-200" },
    customer: { title: "Müşteri (Standart)", level: "Sınırlı (Level 2)", color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  };

  const ROLES = ["admin", "customer"].map(roleKey => {
    const dbStat = stats.find(s => s.role === roleKey);
    return {
      id: roleKey,
      ...roleMap[roleKey],
      userCount: dbStat?.count || 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Roller & Yetkiler"
          description="Sistemdeki kullanıcı rollerini ve izinleri yönetin"
        />
        <Link href="/yonetim/roller/yeni" className="flex items-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-panel-secondary shadow-sm transition-colors">
          Yeni Rol Oluştur
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-panel-secondary bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-panel-secondary bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold">Rol Adı</th>
                <th className="px-6 py-4 font-semibold">Kullanıcı Sayısı</th>
                <th className="px-6 py-4 font-semibold">İzin Seviyesi</th>
                <th className="px-6 py-4 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {ROLES.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <p className="text-base font-medium text-foreground">Özel Rol Bulunamadı</p>
                      <p className="text-sm">Sisteme kayıtlı varsayılan veya özel bir rol atanmamış.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                ROLES.map((r, i) => (
                  <tr key={i} className="group hover:bg-panel-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${r.color}`}>
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-muted">
                        <span className="text-foreground">{r.userCount}</span> Kullanıcı
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-panel-secondary px-2.5 py-1 text-xs font-semibold text-muted">
                        {r.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/yonetim/roller/matris?role=${r.id}`}
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:bg-white hover:text-primary hover:shadow-sm transition-all border border-transparent hover:border-panel-secondary"
                          title="Yetki Matrisini Gör"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button 
                          className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:bg-white hover:text-primary hover:shadow-sm transition-all border border-transparent hover:border-panel-secondary"
                          title="Rolü Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
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
