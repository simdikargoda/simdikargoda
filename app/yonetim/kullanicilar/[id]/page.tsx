import Link from "next/link";
import { ArrowLeft, User, Shield, Mail, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

export default async function KullaniciDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    notFound();
  }

  const roleLabel =
    user.role === "admin"
      ? "Sistem Yöneticisi"
      : "Müşteri";
  const statusLabel = user.status === "active" ? "Aktif" : "Pasif";
  const statusColor = user.status === "active" ? "green" : "slate";

  return (
    <div className="space-y-6">
      <Link
        href="/yonetim/kullanicilar"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Sistem Kullanıcılarına Dön
      </Link>

      <PageHeader
        title="Kullanıcı Detayları"
        description={`${user.name} kullanıcısının hesap ve yetki bilgileri`}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 lg:col-span-3">
          <div className="rounded-2xl border border-panel-secondary bg-panel p-6 flex flex-col items-center text-center shadow-sm">
            <div className="h-24 w-24 rounded-full border-4 border-panel-secondary overflow-hidden bg-primary flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-inner">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted mb-4">{user.email}</p>
            <StatusBadge label={statusLabel} color={statusColor} />
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Yetki Rolü" value={roleLabel} />
            <StatCard
              label="Kayıt Tarihi"
              value={new Date(user.createdAt).toLocaleDateString("tr-TR")}
            />
            <StatCard
              label="Son Güncelleme"
              value={new Date(user.updatedAt).toLocaleDateString("tr-TR")}
            />
          </div>

          <div className="rounded-2xl border border-panel-secondary bg-panel p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Kimlik Doğrulama</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-panel-secondary/30 p-4 flex items-center gap-4 border border-panel-secondary/50">
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">İki Aşamalı Doğrulama (2FA)</p>
                  <p className="text-sm font-semibold text-foreground">
                    {user.isTwoFactorEnabled ? "Aktif" : "Kapalı"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-panel-secondary/30 p-4 flex items-center gap-4 border border-panel-secondary/50">
                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">E-posta Adresi</p>
                  <p className="text-sm font-semibold text-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
