"use client";

import { useActionState, useEffect } from "react";
import { saveNetgsmConfig, NetgsmConfigState } from "./actions";
import { toast } from "sonner";
import { Save, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function NetgsmForm() {
  const [state, formAction, isPending] = useActionState(saveNetgsmConfig, {});
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("NetGSM ayarları başarıyla güncellendi.");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="card-surface rounded-2xl border border-panel-secondary p-6 mt-6 max-w-2xl">
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
