import { notFound } from "next/navigation";
import { ArrowLeft, UserCircle2, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { PageHeader } from "@/components/ui/page-header";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { requireStaff } from "@/lib/guard";
import { AdminPasswordForm } from "./admin-password-form";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  
  const { id } = await params;
  const db = getDb();
  
  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!targetUser) {
    notFound();
  }

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Kullanıcı Detayı" 
          description={`${targetUser.name} profili ve yetkileri`}
        />
        <Link
          href="/yonetim/kullanicilar"
          className="inline-flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Kullanıcılara Dön
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* Sol Kolon: Profil Özeti */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5">
                <UserCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{targetUser.name}</h2>
              <div className="mt-4 flex gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${targetUser.status === "active" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                  {targetUser.status === "active" ? "Aktif" : "Pasif"}
                </span>
                <span className="inline-flex rounded-full bg-info/10 text-info px-2.5 py-0.5 text-xs font-bold uppercase">
                  {targetUser.role === "admin" ? "Sistem Yöneticisi" : "Müşteri"}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">E-posta</p>
                  <p className="text-sm font-medium text-foreground">{targetUser.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">MFA Durumu</p>
                  <p className="text-sm font-medium text-foreground">{targetUser.isTwoFactorEnabled ? "Aktif (Açık)" : "Pasif (Kapalı)"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-muted" />
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">Kayıt Tarihi</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(targetUser.createdAt, "dd MMMM yyyy HH:mm", { locale: tr })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Düzenleme ve İşlemler */}
        <div className="space-y-6">
          {/* Burada ileride kullanıcı düzenleme formu da olabilir */}
          <AdminPasswordForm userId={targetUser.id} />
        </div>
      </div>
    </div>
  );
}
