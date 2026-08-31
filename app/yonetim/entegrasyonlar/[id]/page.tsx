"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Save, CheckCircle2, Plug, Settings2, Activity, KeyRound, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

// Aynı mock data listesi
const INTEGRATIONS = {
  trendyol: { name: "Trendyol", type: "Pazaryeri", color: "bg-orange-500", desc: "Trendyol pazaryeri siparişlerini otomatik senkronize edin." },
  hepsiburada: { name: "Hepsiburada", type: "Pazaryeri", color: "bg-orange-600", desc: "Hepsiburada API ile mağazanızı bağlayın." },
  netgsm: { name: "NetGSM SMS", type: "Bildirim", color: "bg-blue-600", desc: "Müşterilerinize SMS bildirimleri gönderin." },
  stripe: { name: "Stripe", type: "Ödeme Geçidi", color: "bg-indigo-500", desc: "Uluslararası ödemeler için Stripe entegrasyonu." },
  iyzico: { name: "Iyzico", type: "Ödeme Geçidi", color: "bg-blue-500", desc: "Kredi kartı tahsilatları için iyzico bağlayın." },
  amazon: { name: "Amazon", type: "Pazaryeri", color: "bg-slate-800", desc: "Amazon Seller Central entegrasyonu." },
};

export default function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  const handleTest = async () => {
    setIsTesting(true);
    
    // Simulate real network request
    setTimeout(() => {
      setIsTesting(false);
      // In a real scenario, this would be a fetch to a server action to test the specific integration's API.
      toast.success(`${integration.name} sunucusuna erişim sağlandı! (200 OK)`);
    }, 1500);
  };
  
  const integration = INTEGRATIONS[id as keyof typeof INTEGRATIONS];

  if (!integration) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold">Entegrasyon Bulunamadı</h2>
        <p className="text-muted mt-2">Aradığınız entegrasyon sistemde mevcut değil.</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 bg-black text-white rounded-xl">Geri Dön</button>
      </div>
    );
  }

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${integration.name} ayarları başarıyla kaydedildi!`);
      setIsActive(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title={`${integration.name} Yapılandırması`} 
          description={integration.desc} 
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
          {/* Status Card */}
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md", integration.color)}>
                <Plug className="h-6 w-6" />
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
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Modül Tipi</label>
                <div className="text-sm font-medium text-foreground">
                  {integration.type}
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-[24px] border border-panel-secondary bg-panel-secondary/30 p-6 shadow-soft">
            <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Geliştirici Dokümantasyonu
            </h4>
            <p className="text-xs text-muted leading-relaxed mb-4">
              {integration.name} API dökümantasyonunu inceleyerek parametreler hakkında daha fazla bilgi edinebilirsiniz.
            </p>
            <button className="text-xs font-semibold text-primary hover:underline">
              Dokümantasyonu Oku &rarr;
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-muted" /> API Kimlik Bilgileri
            </h3>
            <p className="text-sm text-muted mb-6">
              {integration.name} panelinden aldığınız API anahtarlarını girin. Bu bilgiler şifrelenerek saklanır.
            </p>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">API Key (Client ID)</label>
                  <input
                    type="text"
                    placeholder="Örn: 9481jalkasd81923..."
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">API Secret (Client Secret)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>
              
              {id === "netgsm" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Gönderici Adı (Başlık)</label>
                  <input
                    type="text"
                    placeholder="Örn: KARGO_SMSG"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <p className="text-xs text-muted mt-1">NetGSM'de onaylanmış olan alfanumerik başlığınız (Originator).</p>
                </div>
              )}
              
              {(integration.type === "Pazaryeri" || integration.type === "Ödeme Geçidi") && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Satıcı ID (Merchant ID)</label>
                  <input
                    type="text"
                    placeholder="Örn: 19283719"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted" /> Gelişmiş Ayarlar
            </h3>
            <p className="text-sm text-muted mb-6">
              Sistem davranışını ve webhook uç noktalarını yapılandırın.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-panel-secondary">
                <div>
                  <h5 className="font-semibold text-sm text-foreground">Test Modu (Sandbox)</h5>
                  <p className="text-xs text-muted mt-0.5">İşlemleri canlı ortama gitmeden test edin.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-panel-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl border border-panel-secondary">
                <div>
                  <h5 className="font-semibold text-sm text-foreground">Otomatik Senkronizasyon</h5>
                  <p className="text-xs text-muted mt-0.5">Veriler arka planda düzenli olarak senkronize edilsin.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
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
