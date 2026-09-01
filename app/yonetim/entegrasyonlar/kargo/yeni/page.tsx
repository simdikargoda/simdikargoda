"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Save, Globe, KeyRound, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export default function YeniKargoFirmasiPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simüle edilen kayıt işlemi
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Kargo firması başarıyla eklendi.");
      router.push("/yonetim/entegrasyonlar/kargo");
    }, 1000);
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Yeni Kargo Firması Ekle" 
          description="Sisteme yeni bir kargo entegrasyonu tanımlayın" 
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Kaydediliyor...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-muted" /> Firma Bilgileri
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Firma Adı</label>
                <input
                  type="text"
                  placeholder="Örn: MNG Kargo"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tema Rengi</label>
                <input
                  type="color"
                  defaultValue="#3b82f6"
                  className="h-10 w-full rounded-xl border border-panel-secondary bg-panel px-2 py-1 outline-none transition-colors focus:border-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-muted" /> API Kimlik Bilgileri
            </h3>
            <p className="text-sm text-muted mb-6">
              Kargo firmasından aldığınız web servis (API) erişim bilgilerini girin.
            </p>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">API URL / Endpoint</label>
                <input
                  type="text"
                  placeholder="Örn: https://api.kargo.com/v1"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">API Username (Key)</label>
                  <input
                    type="text"
                    placeholder="Kullanıcı Adı veya API Key"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">API Password (Secret)</label>
                  <input
                    type="password"
                    placeholder="Şifre veya API Secret"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
