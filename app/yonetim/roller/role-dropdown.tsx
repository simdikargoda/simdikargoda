"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateUserRoleAction, type UpdateUserRoleState } from "./actions";

export function RoleDropdown({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: "admin" | "customer";
}) {
  const [state, formAction, pending] = useActionState<UpdateUserRoleState, FormData>(
    updateUserRoleAction,
    {}
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Rol başarıyla güncellendi.");
    }
  }, [state]);

  return (
    <form action={formAction} className="inline-flex w-40 ml-auto">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        onChange={(e) => e.target.form?.requestSubmit()}
        disabled={pending}
        className="w-full rounded-lg border border-panel-secondary bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:bg-panel-secondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
      >
        <option value="admin">Sistem Yöneticisi</option>
        <option value="customer">Müşteri (Standart)</option>
      </select>
    </form>
  );
}
