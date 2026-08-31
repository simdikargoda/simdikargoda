"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, LogOut, PanelLeftClose, PanelLeftOpen, CheckCircle2, AlertTriangle, UserPlus, X, User, Menu } from "lucide-react";

import { logoutAction } from "@/app/(auth)/cikis/actions";
import { useSidebar } from "@/components/layout/sidebar-layout";
import { cn } from "@/lib/cn";

const MOCK_NOTIFICATIONS: any[] = [];

/** Premium yönetim paneli header — arama çubuğu, bildirim ve çıkış eklendi. */
export function PanelHeader({ user }: { user?: any }) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, setMobileOpen } = useSidebar();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca bildirimi kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-panel-secondary bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      
      {/* Sol Kısım: Menü Toggle & Arama Çubuğu */}
      <div className="flex-1 max-w-2xl w-full flex items-center">
        {/* Masaüstü Sidebar Aç/Kapa */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center h-[38px] w-11 rounded-l-2xl border border-r-0 border-panel-secondary bg-panel-secondary/30 text-muted hover:bg-panel-secondary hover:text-foreground transition-colors shrink-0"
          title={isCollapsed ? "Menüyü Genişlet" : "Menüyü Daralt"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
        
        {/* Mobil Sidebar Aç */}
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
        
        {/* Bildirim Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Bildirimler"
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl border border-panel-secondary transition-colors",
              isNotifOpen ? "bg-panel-secondary text-foreground" : "text-muted hover:bg-panel-secondary hover:text-foreground"
            )}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border border-panel-secondary bg-white shadow-xl focus:outline-none animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-panel-secondary px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Bildirimler</h3>
                <button className="text-xs font-medium text-primary hover:underline">
                  Tümünü Okundu İşaretle
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {MOCK_NOTIFICATIONS.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-secondary/50 text-muted mb-3">
                      <Bell className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Bildirim Bulunmuyor</p>
                    <p className="text-xs text-muted mt-1">Sistem tarafından gönderilen yeni<br/>bir bildiriminiz yok.</p>
                  </div>
                ) : (
                  MOCK_NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-panel-secondary/50",
                      !notif.read && "bg-primary/[0.02]"
                    )}>
                      <div className="mt-0.5 shrink-0">
                        {notif.type === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {notif.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning" />}
                        {notif.type === "info" && <UserPlus className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={cn("text-sm font-medium leading-none text-foreground", !notif.read && "font-semibold")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted/80 pt-1">
                          {notif.time}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="shrink-0 pt-1">
                          <span className="block h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-panel-secondary p-2 text-center text-xs">
                <button className="font-medium text-muted hover:text-foreground">Tüm Bildirimleri Gör</button>
              </div>
            </div>
          )}
        </div>

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
              {user?.name ? user.name.split(" ")[0][0].toUpperCase() + (user.name.split(" ")[1] ? user.name.split(" ")[1][0].toUpperCase() : "") : "US"}
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
