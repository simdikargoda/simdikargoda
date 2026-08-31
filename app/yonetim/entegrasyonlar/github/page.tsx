"use client";

import { useActionState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Github, CloudUpload, CloudDownload, Terminal, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { gitPushAction, gitPullAction, type GitActionState } from "./actions";
import { Button } from "@/components/ui/button";

export default function GithubIntegrationPage() {
  const router = useRouter();

  const [pushState, pushAction, isPushing] = useActionState<GitActionState, FormData>(
    gitPushAction,
    {}
  );

  const [pullState, pullAction, isPulling] = useActionState<GitActionState, FormData>(
    gitPullAction,
    {}
  );

  useEffect(() => {
    if (pushState.error) toast.error(pushState.error);
    if (pushState.success) toast.success(pushState.message);
  }, [pushState]);

  useEffect(() => {
    if (pullState.error) toast.error(pullState.error);
    if (pullState.success) toast.success(pullState.message);
  }, [pullState]);

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="GitHub Entegrasyonu" 
          description="Uygulama kaynak kodlarını yedekleyin ve güncellemeleri çekin." 
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-md">
                <Github className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">GitHub Bağlantısı</h3>
                <div className="flex items-center gap-1 text-xs font-medium text-success mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> <span>Aktif ve Yetkilendirilmiş</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Mevcut Depo (Repository)</label>
                <div className="rounded-lg bg-panel-secondary px-3 py-2 text-sm font-medium text-foreground">
                  simdikargoda/simdikargoda
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider">Hedef Dal (Branch)</label>
                <div className="rounded-lg bg-panel-secondary px-3 py-2 text-sm font-medium text-foreground">
                  main
                </div>
              </div>

              <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 mt-6">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
                  <div className="text-sm text-warning-foreground">
                    <p className="font-semibold mb-1">Kimlik Doğrulama Hakkında</p>
                    <p className="opacity-90 text-xs leading-relaxed">
                      GitHub yetkilendirmeniz işletim sistemi seviyesindeki (Git Credential Manager) oturumunuz üzerinden güvenle yapılmaktadır. Token girmenize gerek yoktur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <h3 className="text-lg font-bold text-foreground mb-1">Manuel İşlemler</h3>
            <p className="text-sm text-muted mb-6">Sunucu üzerindeki kodları manuel olarak yönetin.</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <form action={pushAction}>
                <button 
                  disabled={isPushing}
                  className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-panel-secondary bg-panel-secondary/20 p-6 transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <CloudUpload className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">Buluta Yedekle (Push)</div>
                    <div className="text-xs text-muted mt-1">Mevcut tüm değişiklikleri GitHub'a gönderir.</div>
                  </div>
                </button>
              </form>

              <form action={pullAction}>
                <button 
                  disabled={isPulling}
                  className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-panel-secondary bg-panel-secondary/20 p-6 transition-all hover:border-success hover:bg-success/5 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success group-hover:scale-110 transition-transform">
                    <CloudDownload className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-foreground">Güncelle (Pull)</div>
                    <div className="text-xs text-muted mt-1">Uzak sunucudaki yeni kodları bu sisteme çeker.</div>
                  </div>
                </button>
              </form>
            </div>
          </div>

          {/* Konsol Çıktısı Alanı */}
          {(pushState.log || pullState.log) && (
            <div className="rounded-[24px] border border-panel-secondary bg-neutral-900 overflow-hidden shadow-soft">
              <div className="flex items-center gap-2 border-b border-white/10 bg-black/40 px-4 py-3">
                <Terminal className="h-4 w-4 text-muted" />
                <span className="text-xs font-semibold text-muted tracking-widest uppercase">Git Konsol Çıktısı</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                  {pushState.log || pullState.log}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
