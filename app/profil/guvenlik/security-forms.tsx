"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Key, ShieldCheck, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { changePasswordAction, verifyAndEnableTwoFactorAction, disableTwoFactorAction } from "./actions";

export function SecurityForms({ 
  isTwoFactorEnabled, 
  qrCodeDataUrl, 
  secret 
}: { 
  isTwoFactorEnabled: boolean; 
  qrCodeDataUrl: string | null; 
  secret: string | null;
}) {
  const initialState = { error: undefined, success: undefined };
  
  const [pwdState, pwdAction, pwdPending] = useActionState<any, FormData>(changePasswordAction, initialState);
  const [mfaEnableState, mfaEnableAction, mfaEnablePending] = useActionState<any, FormData>(verifyAndEnableTwoFactorAction, initialState);
  const [mfaDisableState, mfaDisableAction, mfaDisablePending] = useActionState<any, FormData>(disableTwoFactorAction, initialState);

  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // Başarı toast mesajlarını göstermek için hack (Next.js action sonrasında useEffect ile de yapılabilir)
  if (pwdState?.success) {
    toast.success(pwdState.success);
    pwdState.success = undefined; // Tekrar çalışmaması için
  }
  if (mfaEnableState?.success) {
    toast.success(mfaEnableState.success);
    mfaEnableState.success = undefined;
  }
  if (mfaDisableState?.success) {
    toast.success(mfaDisableState.success);
    mfaDisableState.success = undefined;
    setShowDisableConfirm(false);
  }

  const inputBase = "w-full rounded-xl border bg-panel px-3 py-2 text-sm text-foreground shadow-soft transition-all duration-150 placeholder:text-muted hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <>
      {/* Şifre Değiştirme */}
      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-6 py-5">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted" />
            <h3 className="text-sm font-semibold text-foreground">Şifre Değiştirme</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted">Hesap şifrenizi güvenli tutmak için düzenli aralıklarla güncelleyin.</p>
        </div>
        <form action={pwdAction} className="px-6 py-6 space-y-4 max-w-sm">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Mevcut Şifre</label>
            <input name="currentPassword" type="password" required className={inputBase} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Yeni Şifre</label>
            <input name="newPassword" type="password" required className={inputBase} minLength={6} />
          </div>
          {pwdState?.error && <p className="text-xs text-danger">{pwdState.error}</p>}
          <button
            type="submit"
            disabled={pwdPending}
            className="flex h-9 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary-strong hover:shadow-lift disabled:opacity-50"
          >
            {pwdPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Şifreyi Güncelle
          </button>
        </form>
      </div>

      {/* 2FA (İki Aşamalı Doğrulama) */}
      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary">
        <div className="border-b border-panel-secondary px-6 py-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted" />
            <h3 className="text-sm font-semibold text-foreground">İki Aşamalı Doğrulama (2FA)</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted">Hesabınızı güvence altına almak için ekstra güvenlik katmanı.</p>
        </div>
        
        <div className="px-6 py-6">
          {isTwoFactorEnabled ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-success/20 bg-success/5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">2FA Etkin</h4>
                  <p className="text-xs text-muted">Authenticator uygulaması kullanılıyor.</p>
                </div>
              </div>
              
              {!showDisableConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDisableConfirm(true)}
                  className="rounded-xl border border-danger text-danger px-4 py-2 text-sm font-medium hover:bg-danger hover:text-white transition-colors"
                >
                  Devre Dışı Bırak
                </button>
              ) : (
                <form action={mfaDisableAction} className="flex flex-col sm:flex-row items-center gap-2">
                  <input name="password" type="password" required placeholder="Hesap Şifreniz" className={`${inputBase} w-36`} />
                  <button type="submit" disabled={mfaDisablePending} className="rounded-xl bg-danger text-white px-3 py-2 text-sm font-medium hover:bg-danger/90 transition-colors">
                    Onayla
                  </button>
                  <button type="button" onClick={() => setShowDisableConfirm(false)} className="rounded-xl bg-panel-secondary px-3 py-2 text-sm font-medium hover:bg-panel-secondary/80">
                    İptal
                  </button>
                  {mfaDisableState?.error && <p className="text-xs text-danger">{mfaDisableState.error}</p>}
                </form>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-warning">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="text-sm font-semibold">2FA Devre Dışı</span>
                </div>
                <p className="text-sm text-muted">
                  Google Authenticator veya uyumlu bir uygulama ile aşağıdaki QR kodunu tarayın ve oluşturulan 6 haneli kodu girin.
                </p>
                <form action={mfaEnableAction} className="space-y-3 max-w-[200px]">
                  <div>
                    <label className="text-xs font-medium text-foreground mb-1 block">Doğrulama Kodu</label>
                    <input name="code" type="text" maxLength={6} required className={`${inputBase} tracking-widest text-center text-lg`} placeholder="000000" />
                  </div>
                  {mfaEnableState?.error && <p className="text-xs text-danger">{mfaEnableState.error}</p>}
                  <button
                    type="submit"
                    disabled={mfaEnablePending}
                    className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-strong disabled:opacity-50"
                  >
                    {mfaEnablePending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Etkinleştir
                  </button>
                </form>
              </div>
              {qrCodeDataUrl && (
                <div className="shrink-0 flex flex-col items-center p-4 border border-panel-secondary rounded-xl bg-white shadow-sm">
                  <img src={qrCodeDataUrl} alt="2FA QR Kod" className="w-40 h-40" />
                  <p className="mt-2 text-[10px] text-muted max-w-[160px] text-center font-mono break-all">{secret}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
