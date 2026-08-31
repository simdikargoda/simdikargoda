"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Database, ExternalLink, KeyRound, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function SupabaseIntegrationPage() {
  const router = useRouter();
  const [anonKey, setAnonKey] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Supabase API anahtarları başarıyla güncellendi.");
    }, 1200);
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Supabase Entegrasyonu" 
          description="Veritabanı, kimlik doğrulama ve gerçek zamanlı servis ayarlarını yönetin." 
        />
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Geri Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Supabase Bağlantısı</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-success mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> <span>Proje Bağlandı</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Proje ID (Reference ID)</label>
                <div className="rounded-lg bg-panel-secondary px-3 py-2 text-sm font-medium text-foreground break-all font-mono">
                  gvenrhikcy••••••••••
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">API URL</label>
                <div className="rounded-lg bg-panel-secondary px-3 py-2 text-sm font-medium text-foreground break-all font-mono">
                  https://gvenrhikcy••••••••••.supabase.co
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
              Uygulamanın Supabase ile iletişim kurabilmesi için gerekli olan API anahtarları.
            </p>
            
            <div className="space-y-5 max-w-2xl">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Project API Key (anon / public)</label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary font-mono"
                />
                <p className="text-xs text-muted">İstemci (tarayıcı) tarafındaki sorgular için kullanılır.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Service Role Key (secret)</label>
                <input
                  type="password"
                  value={serviceKey}
                  onChange={(e) => setServiceKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary font-mono"
                />
                <p className="text-xs text-warning-foreground mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>
                  Bu anahtar tüm veritabanına sınırsız erişim sağlar. İstemci tarafında ASLA paylaşılmamalıdır.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      Kaydediliyor...
                    </span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Anahtarları Kaydet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-panel-secondary bg-panel-secondary/30 p-6 shadow-soft flex items-center justify-between">
            <div>
              <h4 className="font-bold text-foreground mb-1">Supabase Studio</h4>
              <p className="text-sm text-muted">Tabloları, kuralları ve veritabanı ayarlarını Supabase panelinden yönetin.</p>
            </div>
            <a 
              href={`https://supabase.com/dashboard/project/gvenrhikcyfhxalvrtnw`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-emerald-600 hover:text-white group"
            >
              Supabase'e Git
              <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
