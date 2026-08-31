"use client";

import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen, Search, Menu } from "lucide-react";

import { logoutAction } from "@/app/(auth)/cikis/actions";
import { useSidebar } from "@/components/layout/sidebar-layout";

/**
 * Yönetim paneli header. Bildirim zili, gerçek bir notification domain
 * olmadığı için kaldırılmıştır (fake boş sistem bırakılmaz). Arama çubuğu
 * global arama sayfasına yönlendirir.
 */
export function PanelHeader({ user }: { user?: any }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, setMobileOpen } = useSidebar();
  void pathname;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-panel-secondary bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Sol Kısım: Menü Toggle & Arama Çubuğu */}
      <div className="flex-1 max-w-2xl w-full flex items-center">
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center h-[38px] w-11 rounded-l-2xl border border-r-0 border-panel-secondary bg-panel-secondary/30 text-muted hover:bg-panel-secondary hover:text-foreground transition-colors shrink-0"
          title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center justify-center h-[38px] w-11 rounded-l-2xl border border-r-0 border-panel-secondary bg-panel-secondary/30 text-muted hover:bg-panel-secondary hover:text-foreground transition-colors shrink-0"
          title="Menüyü Aç"
        >
          <Menu className="h-5 w-5" />
        </button>

        <form action="/yonetim/arama" className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            name="q"
            placeholder="Müşteri, kargo veya takip no ara..."
            className="block w-full pl-10 pr-3 py-2 border border-panel-secondary rounded-2xl lg:rounded-l-none leading-5 bg-panel-secondary/50 placeholder-muted focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all duration-200"
            required
          />
        </form>
      </div>

      {/* Sağ aksiyonlar */}
      <div className="flex shrink-0 items-center gap-3 justify-end">
        {/* Profil butonu */}
        <a
          href="/profil"
          className="flex items-center gap-2 h-9 px-2 sm:px-3 rounded-xl border border-panel-secondary text-sm font-medium text-muted transition hover:bg-primary/5 hover:text-primary hover:border-primary/20"
          title="Profil ve Hesap Yönetimi"
        >
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name} className="h-6 w-6 rounded-full object-cover shrink-0 border border-panel-secondary" />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {user?.name ? user.name.split(" ")[0][0].toUpperCase() : "US"}
            </div>
          )}
          <span className="hidden sm:inline-block font-semibold">
            {user?.name ? user.name.split(" (")[0] : "Profil"}
          </span>
        </a>

        {/* Çıkış Yap butonu */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 h-9 px-3 rounded-xl border border-panel-secondary text-sm font-medium text-muted transition hover:bg-danger/8 hover:text-danger hover:border-danger/20"
            title="Sistemden Çıkış Yap"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline-block">Çıkış Yap</span>
          </button>
        </form>
      </div>
    </header>
  );
}
