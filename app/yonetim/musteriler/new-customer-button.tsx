"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createCustomerAction, type CreateCustomerState } from "./actions";

export function NewCustomerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Yeni Müşteri
      </Button>
      <NewCustomerDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function NewCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<"balance" | "current_account">("balance");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const res: CreateCustomerState = await createCustomerAction({}, formData);
    setPending(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Müşteri oluşturuldu");
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Yeni müşteri"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-panel shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-panel-secondary px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Yeni Müşteri</h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="rounded-lg p-1 text-muted hover:bg-panel-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Müşteri / Firma Adı *" name="name" required />
            </div>
            <Input label="Yetkili Kişi" name="authorizedPerson" />
            <Input label="Telefon *" name="phone" required />
            <Input label="E-posta *" type="email" name="email" required />
            <Select
              label="Çalışma Tipi *"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="balance">Bakiyeli</option>
              <option value="current_account">Cari</option>
            </Select>
            <Input label="Vergi Dairesi" name="taxOffice" />
            <Input label="Vergi No" name="taxNumber" />
            <Input label="İl" name="city" />
            <Input label="İlçe" name="district" />
            <div className="sm:col-span-2">
              <Textarea label="Adres" name="address" rows={2} />
            </div>
          </div>

          {type === "balance" ? (
            <div className="rounded-xl border border-panel-secondary bg-panel-secondary/40 p-4">
              <Input
                label="Başlangıç Bakiyesi (₺)"
                name="initialBalance"
                type="number"
                min={0}
                step="0.01"
                help="Opsiyonel — boş bırakılırsa 0 ile başlar."
              />
            </div>
          ) : (
            <div className="rounded-xl border border-panel-secondary bg-panel-secondary/40 p-4">
              <Input
                label="Cari Limit (₺)"
                name="initialLimit"
                type="number"
                min={0}
                step="0.01"
                help="Opsiyonel — boş bırakılırsa 0 limit ile başlar."
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-panel-secondary pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" loading={pending}>
              Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
