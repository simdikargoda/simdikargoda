"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { saveNetgsmConfig, testNetgsmConfig, NetgsmConfigState } from "./actions";
import { toast } from "sonner";
import { Save, AlertCircle, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function NetgsmForm() {
  const [state, formAction, isPending] = useActionState(saveNetgsmConfig, {});
  const router = useRouter();
  
  const [isTestPending, startTestTransition] = useTransition();

  useEffect(() => {
    if (state.success) {
      toast.success("NetGSM ayarları başarıyla güncellendi.");
      router.refresh();
    }
  }, [state.success, router]);

  const handleTest = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    if (!formData.get("usercode") || !formData.get("password") || !formData.get("header")) {
      toast.error("Test etmek için lütfen tüm alanları doldurun.");
      return;
    }

    startTestTransition(async () => {
      const res = await testNetgsmConfig(formData);
      if (res.error) {
        toast.error(res.error);
      } else if (res.success) {
        toast.success("Test Başarılı! Bilgiler doğru.");
      }
    });
  };

  return (
    <div className="card-surface rounded-2xl border border-panel-secondary p-6 w-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">API Bilgilerini Girin</h3>
      
      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">NETGSM_USERCODE</label>
          <input
            type="text"
            name="usercode"
            required
            placeholder="Kullanıcı Adı / Abone No"
            className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">NETGSM_PASSWORD</label>
          <input
            type="password"
            name="password"
            required
            placeholder="Şifre"
            className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">NETGSM_HEADER</label>
          <input
            type="text"
            name="header"
            required
            placeholder="Örn: 850..."
            className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-white"
          />
          <p className="text-xs text-muted">Netgsm panelinde onaylanmış gönderici başlığınız.</p>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending || isTestPending}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Kaydet
          </button>
          
          <button
            onClick={handleTest}
            disabled={isPending || isTestPending}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-panel-secondary bg-white px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-panel-secondary disabled:opacity-50"
          >
            {isTestPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
            ) : (
              <Zap className="h-4 w-4 text-warning" />
            )}
            Test Et
          </button>
        </div>
      </form>
    </div>
  );
}
