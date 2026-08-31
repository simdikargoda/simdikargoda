"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Truck, CheckCircle2, XCircle, Settings2, KeySquare, Link2, Save, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

// Mock Data
type CargoStatus = "active" | "inactive" | "error";

interface CargoProvider {
  id: string;
  name: string;
  status: CargoStatus;
  lastSync?: string;
  color: string;
}

const CARGO_PROVIDERS: CargoProvider[] = [
  { id: "yurtici", name: "Yurtiçi Kargo", status: "active", lastSync: "10 dk önce", color: "bg-blue-500" },
  { id: "aras", name: "Aras Kargo", status: "active", lastSync: "1 saat önce", color: "bg-red-500" },
  { id: "mng", name: "MNG Kargo", status: "inactive", color: "bg-orange-500" },
  { id: "surat", name: "Sürat Kargo", status: "error", lastSync: "Dün 15:30", color: "bg-yellow-500" },
  { id: "ptt", name: "PTT Kargo", status: "inactive", color: "bg-emerald-600" },
  { id: "sendeo", name: "Sendeo", status: "inactive", color: "bg-indigo-500" },
];

export default function KargoEntegrasyonPage() {
  const [selectedProvider, setSelectedProvider] = useState<CargoProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    isActive: false,
    isTestMode: true,
    apiKey: "",
    apiSecret: "",
    webhookUrl: ""
  });

  const handleProviderClick = (provider: CargoProvider) => {
    setSelectedProvider(provider);
    // Mock dolum
    setFormData({
      isActive: provider.status === "active",
      isTestMode: provider.status === "error", // sırf örnek olsun diye
      apiKey: provider.status !== "inactive" ? "live_key_******************" : "",
      apiSecret: provider.status !== "inactive" ? "******************" : "",
      webhookUrl: "https://api.kargo-ops.com/webhooks/cargo/" + provider.id
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Fake API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`${selectedProvider?.name} yapılandırması başarıyla kaydedildi.`);
      setSelectedProvider(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kargo Firmaları"
        description="Gönderi entegrasyonu, API anahtarları ve webhook konfigürasyonları"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARGO_PROVIDERS.map((provider) => (
          <div
            key={provider.id}
            onClick={() => handleProviderClick(provider)}
            className="group cursor-pointer rounded-2xl border border-panel-secondary bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-float"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-soft", provider.color)}>
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{provider.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                    {provider.status === "active" && (
                      <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Bağlantı Aktif</span>
                    )}
                    {provider.status === "inactive" && (
                      <span className="flex items-center gap-1 text-muted"><Settings2 className="h-3.5 w-3.5" /> Yapılandırılmadı</span>
                    )}
                    {provider.status === "error" && (
                      <span className="flex items-center gap-1 text-danger"><XCircle className="h-3.5 w-3.5" /> Bağlantı Hatası</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex items-center justify-between border-t border-panel-secondary pt-4 text-xs text-muted">
              <span>{provider.lastSync ? `Son Senkronizasyon: ${provider.lastSync}` : "Hiç senkronize edilmedi"}</span>
              <span className="font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Yapılandır &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-over Form Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" 
            onClick={() => !isSaving && setSelectedProvider(null)}
          />
          
          {/* Drawer */}
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col border-l border-panel-secondary animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-panel-secondary px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white", selectedProvider.color)}>
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selectedProvider.name} Entegrasyonu</h2>
                </div>
              </div>
              <button 
                onClick={() => !isSaving && setSelectedProvider(null)}
                className="rounded-full p-2 text-muted hover:bg-panel-secondary hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="integration-form" onSubmit={handleSave} className="space-y-6">
                
                {/* Durum & Ortam */}
                <div className="space-y-4 rounded-xl border border-panel-secondary bg-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-medium text-foreground">Entegrasyon Durumu</span>
                      <span className="text-xs text-muted">API bağlantısını tamamen açar veya kapatır.</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <div className="h-6 w-11 rounded-full bg-panel-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-success peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-success/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-panel-secondary border-dashed">
                    <div>
                      <span className="block text-sm font-medium text-foreground">Test Ortamı (Sandbox)</span>
                      <span className="text-xs text-muted">İşlemler kargo firmasının test sunucusuna iletilir.</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={formData.isTestMode}
                        onChange={(e) => setFormData({...formData, isTestMode: e.target.checked})}
                      />
                      <div className="h-6 w-11 rounded-full bg-panel-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-warning peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-warning/20"></div>
                    </label>
                  </div>
                </div>

                {/* API Credentials */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <KeySquare className="h-4 w-4 text-primary" /> API Kimlik Bilgileri
                  </h3>
                  
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">API Key / Kullanıcı Adı</label>
                    <input
                      type="text"
                      className="block w-full rounded-xl border border-panel-secondary bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                      placeholder="Kargo firmasından alınan API Anahtarı"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">API Secret / Şifre</label>
                    <input
                      type="password"
                      className="block w-full rounded-xl border border-panel-secondary bg-white px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                      placeholder="••••••••••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Webhook */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Link2 className="h-4 w-4 text-primary" /> Webhook (Geri Bildirim) URL
                  </h3>
                  <div>
                    <p className="mb-2 text-xs text-muted">
                      Kargo durum güncellemelerini (Teslim edildi, İade vs.) anlık almak için bu URL'i {selectedProvider.name} paneline tanımlayın.
                    </p>
                    <div className="flex rounded-xl shadow-sm">
                      <input
                        type="text"
                        readOnly
                        className="block w-full rounded-l-xl border border-panel-secondary bg-panel px-3 py-2 text-sm text-muted focus:outline-none"
                        value={formData.webhookUrl}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(formData.webhookUrl);
                          toast.info("Webhook URL kopyalandı.");
                        }}
                        className="flex items-center justify-center rounded-r-xl border border-l-0 border-panel-secondary bg-panel-secondary px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/10"
                      >
                        Kopyala
                      </button>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="border-t border-panel-secondary p-4 bg-panel/50">
              <button
                type="submit"
                form="integration-form"
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
              >
                {isSaving ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Kaydediliyor...</>
                ) : (
                  <><Save className="h-4 w-4" /> Ayarları Kaydet</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
