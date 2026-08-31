"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, CloudUpload, Link as LinkIcon, ExternalLink, Settings, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function VercelIntegrationPage() {
  const router = useRouter();
  const [deployHook, setDeployHook] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    if (!deployHook) {
      toast.error("Lütfen Vercel Deploy Hook URL'sini girin.");
      return;
    }
    
    setIsDeploying(true);
    try {
      const res = await fetch(deployHook, { method: "POST" });
      if (res.ok) {
        toast.success("Dağıtım tetiklendi! Değişiklikler birkaç dakika içinde yayına alınacaktır.");
      } else {
        toast.error("Dağıtım tetiklenirken bir hata oluştu.");
      }
    } catch (e) {
      toast.error("Bağlantı hatası: Deploy Hook adresini kontrol edin.");
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Vercel Entegrasyonu" 
          description="Dağıtım (Deployment) süreçlerinizi ve sunucu ayarlarını yönetin." 
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white shadow-md">
                <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#ffffff"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-foreground">Vercel Bağlantısı</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-success mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> <span>Proje Bağlandı</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Proje ID</label>
                <div className="rounded-lg bg-panel-secondary px-3 py-2 text-sm font-medium text-foreground break-all font-mono flex items-center justify-between">
                  <span>prj_uLPIloJx••••••••••••••••••••</span>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Durum</label>
                <div className="rounded-lg bg-panel-secondary px-3 py-2 text-sm font-medium text-foreground flex justify-between items-center">
                  <span>Proje bağlandı (.vercel yapılandırıldı)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1">Üretime Al (Deploy)</h3>
            <p className="text-sm text-muted mb-6">
              Vercel projenizde oluşturduğunuz <strong>Deploy Hook</strong> URL'sini kullanarak anında dağıtım tetikleyebilirsiniz.
            </p>
            
            <div className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Deploy Hook URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deployHook}
                    onChange={(e) => setDeployHook(e.target.value)}
                    placeholder="https://api.vercel.com/v1/integrations/deploy/prj_uLPIlo..."
                    className="flex-1 rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button 
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isDeploying ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        Tetikleniyor...
                      </span>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4" />
                        Deploy Tetikle
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Vercel projenizde <strong>Settings &gt; Git &gt; Deploy Hooks</strong> altından URL oluşturabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-panel-secondary bg-panel-secondary/30 p-6 shadow-soft flex items-center justify-between">
            <div>
              <h4 className="font-bold text-foreground mb-1">Vercel Kontrol Paneli</h4>
              <p className="text-sm text-muted">Daha detaylı analiz ve ayarlar için Vercel paneline gidin.</p>
            </div>
            <a 
              href="https://vercel.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-black hover:text-white group"
            >
              Vercel'e Git
              <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
