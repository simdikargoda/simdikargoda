"use client";

import { useActionState, useEffect } from "react";
import { adminChangePasswordAction } from "./actions";
import { toast } from "sonner";
import { KeyRound, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminPasswordForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(adminChangePasswordAction, { error: "", success: "" });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Şifreyi Sıfırla (Admin Yetkisi)</h3>
          <p className="text-xs text-muted">Kullanıcının şifresini zorla değiştirin. Tüm açık oturumları sonlandırılır.</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="userId" value={userId} />

        {state.error && (
          <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        <div>
          <Input
            label="Yeni Şifre"
            type="password"
            name="newPassword"
            required
            minLength={6}
            placeholder="En az 6 karakter"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="danger" disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Şifreyi Değiştir
          </Button>
        </div>
      </form>
    </div>
  );
}
