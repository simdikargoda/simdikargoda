"use client";

import { useActionState, useEffect } from "react";
import { Loader2, UserPen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { adminChangeNameAction } from "./actions";

export function AdminNameForm({ userId, currentName }: { userId: string, currentName: string }) {
  const [state, formAction, isPending] = useActionState(adminChangeNameAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const inputBase =
    "w-full rounded-xl border bg-panel px-3 py-2 text-sm text-foreground shadow-soft transition-all duration-150 placeholder:text-muted hover:border-primary/40 focus:shadow-lift focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/30";

  return (
    <div className="rounded-2xl border border-panel-secondary bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Kullanıcı Adını Değiştir</h3>
          <p className="text-xs text-muted">Kullanıcının sistemdeki görünen adını (username) güncelleyebilirsiniz.</p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="userId" value={userId} />

        <div>
          <label htmlFor="newName" className="mb-1.5 block text-xs font-semibold text-muted uppercase tracking-wider">
            Yeni Kullanıcı Adı
          </label>
          <input
            id="newName"
            name="newName"
            type="text"
            required
            defaultValue={currentName}
            placeholder="Kullanıcı Adı"
            className={inputBase}
          />
        </div>

        {state.success ? (
          <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{state.success}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-primary-strong hover:shadow-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPen className="h-4 w-4" />
          )}
          {isPending ? "Kaydediliyor..." : "Adı Güncelle"}
        </button>
      </form>
    </div>
  );
}
