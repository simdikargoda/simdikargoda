"use client";

import { useActionState, useEffect } from "react";
import { createUserAction, NewUserState } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";
import Link from "next/link";

const initialState: NewUserState = {};

export function NewUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success("Kullanıcı başarıyla oluşturuldu.");
      router.push("/yonetim/kullanicilar");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-sm max-w-2xl">
      <form action={formAction} className="space-y-6">
        {state.error && (
          <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Ad Soyad</label>
              <input
                type="text"
                name="name"
                required
                placeholder="Örn: Ozan Ahmet"
                className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-3 py-2 text-sm text-foreground placeholder-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">E-posta</label>
              <input
                type="email"
                name="email"
                required
                placeholder="ozan@example.com"
                className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-3 py-2 text-sm text-foreground placeholder-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Şifre</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="En az 6 karakter"
                className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-3 py-2 text-sm text-foreground placeholder-muted focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Rol</label>
              <select
                name="role"
                required
                defaultValue="admin"
                className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none"
              >
                <option value="admin">Sistem Yöneticisi</option>
                <option value="customer">Müşteri</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-panel-secondary">
          <Link
            href="/yonetim/kullanicilar"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-panel-secondary transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-sm disabled:opacity-70"
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
