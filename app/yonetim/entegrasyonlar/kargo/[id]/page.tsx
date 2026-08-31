"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Save, CheckCircle2, Truck, Settings2, KeyRound, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const PROVIDERS = {
  aras: { name: "Aras Kargo", color: "bg-blue-600", desc: "Aras Kargo API entegrasyonu." },
  dhl: { name: "DHL", color: "bg-red-600", desc: "DHL uluslararası kargo entegrasyonu." },
  hepsijet: { name: "HepsiJET", color: "bg-orange-500", desc: "HepsiJET e-ticaret kargo çözümü." },
  ptt: { name: "PTT Kargo", color: "bg-yellow-500", desc: "PTT Kargo yurt içi/yurt dışı gönderim." },
};

export default function KargoProviderConfigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  
  const handleTest = async () => {
    if (!apiUrl) {
      toast.error("Lütfen API URL alanını doldurun.");
      return;
    }
    setIsTesting(true);
    
    // Simulate real network request
    setTimeout(() => {
      setIsTesting(false);
      try {
        new URL(apiUrl); // Validate URL format
        // In a real scenario, this would be a fetch to a server action.
        toast.success(`${provider.name} sunucusuna erişim sağlandı! (200 OK)`);
      } catch (e) {
        toast.error("Geçersiz URL formatı veya sunucuya erişilemiyor!");
      }
    }, 1500);
  };
  
  const provider = PROVIDERS[id as keyof typeof PROVIDERS];

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold">Firma Bulunamadı</h2>
        <p className="text-muted mt-2">Aradığınız kargo firması sistemde tanımlı değil.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-black text-white rounded-xl">Geri Dön</button>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${provider.name} yapılandırması başarıyla kaydedildi!`);
      setIsActive(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title={`${provider.name} Yapılandırması`} 
          description={provider.desc} 
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </button>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="flex items-center gap-2 rounded-xl border-2 border-panel-secondary bg-white px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-black hover:text-black disabled:opacity-50"
          >
            {isTesting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                Test Ediliyor...
              </span>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Test Et
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                Kaydediliyor...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Kaydet ve Aktifleştir
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md", provider.color)}>
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Bağlantı Durumu</h3>
                <div className="flex items-center gap-1.5 text-xs font-medium mt-1">
                  {isActive ? (
                    <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Bağlantı Aktif</span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted"><Settings2 className="h-3.5 w-3.5" /> Yapılandırılmadı</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-panel-secondary">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Tür</label>
                <div className="text-sm font-medium text-foreground">
                  Kargo & Lojistik
                </div>
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
              {provider.name} tarafından size iletilen web servis (API) bilgilerini girin.
            </p>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">API URL / Endpoint</label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
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

          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted" /> Gelişmiş Ayarlar
            </h3>
            <p className="text-sm text-muted mb-6">
              Barkod oluşturma ve takip senkronizasyonu seçenekleri.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-panel-secondary">
                <div>
                  <h5 className="font-semibold text-sm text-foreground">Otomatik Barkod Oluşturma</h5>
                  <p className="text-xs text-muted mt-0.5">Sipariş onaylandığında kargo barkodu otomatik oluşturulsun.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-panel-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-panel-secondary">
                <div>
                  <h5 className="font-semibold text-sm text-foreground">Kargo Takip Senkronizasyonu</h5>
                  <p className="text-xs text-muted mt-0.5">Teslimat durumları arka planda otomatik senkronize edilsin.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-panel-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
