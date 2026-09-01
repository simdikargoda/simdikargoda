"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Save, Building2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

export default function FirmaBilgileriPage() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Firma bilgileri başarıyla güncellendi.");
    }, 800);
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Firma Bilgileri" 
          description="Fatura ve iletişim bilgilerini yönetin" 
        />
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted" /> Ticari Bilgiler
            </h3>
            <p className="text-sm text-muted mb-6">
              Faturalandırma ve resmi yazışmalarda kullanılacak bilgiler.
            </p>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Firma Ünvanı</label>
                <input
                  type="text"
                  required
                  defaultValue="Şimdi Kargoda Lojistik A.Ş."
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Vergi Dairesi</label>
                  <input
                    type="text"
                    defaultValue="Marmara Kurumlar"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Vergi Numarası</label>
                  <input
                    type="text"
                    defaultValue="1234567890"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted" /> Adres Bilgileri
            </h3>
            <p className="text-sm text-muted mb-6">
              Merkez ofis adres bilgileriniz.
            </p>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">İl</label>
                  <input
                    type="text"
                    defaultValue="İstanbul"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">İlçe</label>
                  <input
                    type="text"
                    defaultValue="Beşiktaş"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Açık Adres</label>
                <textarea
                  rows={3}
                  defaultValue="Levent Mah. Çayır Çimen Sok. No: 12 Kat: 3"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted" /> İletişim
            </h3>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Telefon</label>
                <input
                  type="text"
                  defaultValue="0850 123 45 67"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">E-posta</label>
                <input
                  type="email"
                  defaultValue="iletisim@simdikargoda.com"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Web Sitesi</label>
                <input
                  type="url"
                  defaultValue="https://simdikargoda.com"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 shadow-md"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Kaydediliyor...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
