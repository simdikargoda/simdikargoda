import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { desc, ne } from "drizzle-orm";
import Link from "next/link";
import { Edit, Shield } from "lucide-react";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Ortak kullanıcı listesi sayfası. Rol ve durum filtresi gerçek veriden
 * gelir; fake kullanılmaz. Yalnız ADMIN kadrosu (customer değil) listelenir.
 */
export default async function UsersListPage({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status?: "active" | "passive";
}) {
  await requireAdmin();
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(ne(users.role, "customer"))
    .orderBy(desc(users.createdAt));

  const filtered = status ? rows.filter((u) => u.status === status) : rows;

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      <div className="overflow-hidden rounded-2xl border border-panel-secondary bg-white shadow-sm">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState title="Kullanıcı bulunamadı" description="Bu filtreyle eşleşen kullanıcı yok." />
          ) : (
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
                {filtered.map((u) => (
                  <tr key={u.id} className="group hover:bg-panel-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 border border-rose-200">
                        <Shield className="h-3 w-3" /> Sistem Yöneticisi
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={
                          u.status === "active"
                            ? "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50"
                            : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50"
                        }
                      >
                        {u.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/yonetim/kullanicilar/${u.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:bg-white hover:text-primary hover:shadow-sm transition-all border border-transparent hover:border-panel-secondary"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
