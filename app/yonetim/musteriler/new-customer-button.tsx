"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createCustomerAction, type CreateCustomerState } from "./actions";

export function NewCustomerButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Yeni Müşteri
      </Button>
      {mounted && createPortal(
        <NewCustomerDialog open={open} onClose={() => setOpen(false)} />,
        document.body
      )}
    </>
  );
}

function NewCustomerDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [type, setType] = useState<"balance" | "current_account">("balance");

  // Escape key for closing
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
    
    toast.success("Müşteri başarıyla oluşturuldu.");
    onClose();
    
    if (res.customerId) {
      router.push(`/yonetim/musteriler/${res.customerId}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all"
      role="dialog"
      aria-modal="true"
      aria-label="Yeni müşteri"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-panel shadow-2xl ring-1 ring-panel-secondary/50 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-panel-secondary bg-panel/90 px-6 py-5 backdrop-blur-md">
          <h2 className="text-lg font-bold text-foreground">Yeni Müşteri Oluştur</h2>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
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
              <option value="balance">Bakiyeli (Ön Ödemeli)</option>
              <option value="current_account">Cari Hesap (Vadeli)</option>
            </Select>
            <Input label="Vergi Dairesi" name="taxOffice" />
            <Input label="Vergi No" name="taxNumber" />
            <Input label="İl" name="city" />
            <Input label="İlçe" name="district" />
            <div className="sm:col-span-2">
              <Textarea label="Adres" name="address" rows={2} />
            </div>

            {type === "balance" ? (
              <div className="sm:col-span-2">
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
              <div className="sm:col-span-2">
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

            <div className="sm:col-span-2 pt-2 border-t border-panel-secondary mt-2">
              <h4 className="text-sm font-semibold text-foreground mb-3">Güvenlik Bilgileri</h4>
              <div className="sm:col-span-1 max-w-sm">
                <Input 
                  label="Müşteri Şifresi (Giriş İçin)" 
                  name="password" 
                  type="password" 
                  placeholder="Opsiyonel" 
                  minLength={6} 
                  help="Doldurulursa müşteri için giriş hesabı oluşturulur."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              İptal Et
            </Button>
            <Button type="submit" loading={pending}>
              Müşteriyi Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
