import { requireAuth } from "@/lib/guard";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { SecurityForms } from "./security-forms";
import { generateTwoFactorSecret, generateQrCodeUrl, encryptSecret, decryptSecret } from "@/lib/2fa";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const session = await requireAuth();

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    return null;
  }

  // Eğer 2FA aktif değilse ama kurulum başlamışsa (secret var), QR kodunu üret
  let qrCodeDataUrl = null;
  let currentSecret = user.twoFactorSecret ? decryptSecret(user.twoFactorSecret) : null;

  if (!user.isTwoFactorEnabled) {
    if (!currentSecret) {
      currentSecret = generateTwoFactorSecret();
      // Yalnızca secret'ı oluşturup DB'ye kaydediyoruz
      await db.update(users).set({ twoFactorSecret: encryptSecret(currentSecret) }).where(eq(users.id, user.id));
    }
    qrCodeDataUrl = await generateQrCodeUrl(user.email, currentSecret);
  }

  return (
    <div className="space-y-6 fade-in-up pb-12">
      {/* Üst Koyu Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-[#0A101D] px-8 py-10 shadow-2xl">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <Link href="/profil" className="inline-flex items-center gap-1.5 text-primary font-bold tracking-wider text-xs uppercase hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Hesap Merkezine Dön
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Güvenlik Ayarları
            </h1>
            <p className="text-panel-secondary/80 text-sm">
              Şifre değişiklikleri yapabilir ve hesabınızın giriş güvenliğini iki aşamalı doğrulama (2FA) ile koruyabilirsiniz.
            </p>
          </div>
          
          <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-warning uppercase tracking-widest mb-0.5">Kimlik Doğrulama</p>
              <p className="text-sm font-semibold text-white">
                {user.isTwoFactorEnabled ? "2FA Etkin" : "Sadece Şifre"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <SecurityForms 
          isTwoFactorEnabled={user.isTwoFactorEnabled} 
          qrCodeDataUrl={qrCodeDataUrl}
          secret={currentSecret}
        />
      </div>
    </div>
  );
}
