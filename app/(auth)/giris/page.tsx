import Link from "next/link";
import { ArrowRight, PackageSearch, ShieldCheck, Truck, BarChart3, Layers3 } from "lucide-react";

import { LoginForm } from "./login-form";

const HIGHLIGHTS = [
  {
    icon: Truck,
    title: "Operasyon akışı",
    text: "Kargo oluşturma, takip ve status history tek akışta.",
  },
  {
    icon: Layers3,
    title: "Finansal kontrol",
    text: "Bakiye ve cari ledger, transaction sınırlarıyla korunur.",
  },
  {
    icon: BarChart3,
    title: "Gerçek raporlama",
    text: "Dashboard ve rapor ekranları aynı metrikleri kullanır.",
  },
  {
    icon: ShieldCheck,
    title: "Yetki ve izolasyon",
    text: "RBAC ve tenant scope, server-side enforced edilir.",
  },
] as const;

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-success/10 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[22%] h-[30rem] w-[30rem] rounded-full bg-info/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-10">
        <section className="glass rounded-[2rem] p-6 shadow-float lg:p-10">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
              <PackageSearch className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Kargo Operasyon Platformu</p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Şimdi Kargoda Yönetim Paneli
              </h1>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-panel-secondary bg-panel p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-panel-secondary text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-6 rounded-2xl border border-panel-secondary bg-panel/70 px-5 py-4">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="font-medium">Güvenli bağlantı</span>
            </div>
            <div className="h-4 w-px bg-panel-secondary" />
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-medium">Tek oturum, tam erişim</span>
            </div>
            <div className="h-4 w-px bg-panel-secondary" />
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              <span className="font-medium">RBAC korumalı</span>
            </div>
          </div>
        </section>

        <section className="glass rounded-[2rem] p-6 shadow-float lg:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lift">
              <PackageSearch className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Hesabınıza giriş yapın
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Müşteri, bakiye/cari, kargo ve raporlama tek sistemden yönetilir.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-muted/80">
            © {new Date().getFullYear()} Kargo Operasyon Platformu
          </p>
        </section>
      </div>
    </main>
  );
}
