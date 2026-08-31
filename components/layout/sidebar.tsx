"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  PackageSearch,
  RotateCcw,
  MapPin,
  Users,
  CreditCard,
  Tags,
  ChartNoAxesCombined,
  MessageSquareText,
  Truck,
  Plug,
  UserCog,
  ShieldCheck,
  ScrollText,
  Settings,
  LogOut,
  Package,
  X,
  ChevronDown,
  FileUp,
  Boxes,
  PackageCheck,
  Clock,
  TrendingUp,
  Plus,
  Calculator,
  TrendingDown,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { logoutAction } from "@/app/(auth)/cikis/actions";

const TLIcon = (props: any) => (
  <span className={cn("inline-flex items-center justify-center font-bold font-sans", props.className)} style={{ fontSize: "1.15em", lineHeight: 1 }}>
    ₺
  </span>
);

import { toast } from "sonner";

const NAV_SECTIONS = [
  {
    title: "OPERASYON",
    items: [
      { href: "/yonetim", label: "Dashboard", icon: LayoutDashboard, exact: true },
      {
        label: "Kargo İşlemleri",
        icon: PackageSearch,
        children: [
          { href: "/yonetim/kargo/yeni", label: "Yeni Kargo Oluştur", icon: PackagePlus, exact: true },
          { href: "/yonetim/kargo/excel", label: "Excel ile Kargo Yükle", icon: FileUp, exact: true },
          { href: "/yonetim/kargo/toplu", label: "Toplu Kargo Oluştur", icon: Boxes, exact: true },
          { href: "/yonetim/kargo/taslak", label: "Taslak Gönderiler", icon: ScrollText, exact: true },
        ],
      },
      {
        label: "Gönderiler",
        icon: Truck,
        children: [
          { href: "/yonetim/kargo", label: "Tüm Gönderiler", icon: PackageSearch, exact: true },
          { href: "/yonetim/kargo/aktarilanlar", label: "Kargoya Aktarılanlar", icon: Truck, exact: true },
          { href: "/yonetim/kargo/aktarilmayanlar", label: "Kargoya Aktarılmayanlar", icon: Package, exact: true },
          { href: "/yonetim/kargo/transferde", label: "Transferde", icon: RotateCcw, exact: true },
          { href: "/yonetim/kargo/dagitimda", label: "Dağıtımda", icon: MapPin, exact: true },
          { href: "/yonetim/kargo/teslim-edilenler", label: "Teslim Edilenler", icon: PackageCheck, exact: true },
          { href: "/yonetim/kargo/bekleyenler", label: "Bekleyenler", icon: Clock, exact: true },
          { href: "/yonetim/kargo/sorunlu", label: "Sorunlu Gönderiler", icon: ShieldCheck, exact: true },
        ],
      },
      {
        label: "İadeler",
        icon: RotateCcw,
        children: [
          { href: "/yonetim/iadeler", label: "Tüm İadeler", icon: RotateCcw, exact: true },
          { href: "/yonetim/iadeler/surec", label: "İade Sürecindekiler", icon: Clock, exact: true },
          { href: "/yonetim/iadeler/tamamlanan", label: "Tamamlanan İadeler", icon: PackageCheck, exact: true },
          { href: "/yonetim/iadeler/sorunlu", label: "Sorunlu İadeler", icon: ShieldCheck, exact: true },
        ],
      },
      {
        label: "Raporlar",
        icon: ChartNoAxesCombined,
        children: [
          { href: "/yonetim/raporlar", label: "Genel Raporlar", icon: ChartNoAxesCombined, exact: true },
          { href: "/yonetim/raporlar/gonderi", label: "Gönderi Raporları", icon: PackageSearch, exact: true },
          { href: "/yonetim/raporlar/finansal", label: "Finansal Raporlar", icon: CreditCard, exact: true },
          { href: "/yonetim/raporlar/karlilik", label: "Kârlılık Raporları", icon: TrendingUp, exact: true },
          { href: "/yonetim/raporlar/musteri", label: "Müşteri Raporları", icon: Users, exact: true },
          { href: "/yonetim/raporlar/firma", label: "Kargo Firması Raporları", icon: Truck, exact: true },
          { href: "/yonetim/raporlar/iade", label: "İade Raporları", icon: RotateCcw, exact: true },
        ],
      },
    ],
  },
  {
    title: "MÜŞTERİ & SATIŞ",
    items: [
      {
        label: "Müşteriler",
        icon: Users,
        children: [
          { href: "/yonetim/musteriler", label: "Tüm Müşteriler", icon: Users, exact: true },
          { href: "/yonetim/musteriler/yeni", label: "Yeni Müşteri Oluştur", icon: Plus, exact: true },
          { href: "/yonetim/musteriler/on-odemeli", label: "Ön Ödemeli Müşteriler", icon: CreditCard, exact: true },
          { href: "/yonetim/musteriler/cari", label: "Cari Müşteriler", icon: Calculator, exact: true },
          { href: "/yonetim/musteriler/pasif", label: "Pasif Müşteriler", icon: UserCog, exact: true },
        ],
      },

      {
        label: "Fiyat Listeleri",
        icon: Tags,
        children: [
          { href: "/yonetim/fiyatlandirma", label: "Genel Fiyat Listeleri", icon: Tags, exact: true },
          { href: "/yonetim/fiyatlandirma/ozel", label: "Müşteriye Özel Fiyatlar", icon: ShieldCheck, exact: true },
          { href: "/yonetim/fiyatlandirma/kargo", label: "Kargo Firması Tarifeleri", icon: Truck, exact: true },
          { href: "/yonetim/fiyatlandirma/yeni", label: "Yeni Fiyat Listesi", icon: Plus, exact: true },
        ],
      },
      {
        label: "Bakiye İşlemleri",
        icon: TLIcon,
        children: [
          { href: "/yonetim/finans/bakiye", label: "Bakiye Özeti", icon: TLIcon, exact: true },
          { href: "/yonetim/finans/bakiye/hareketler", label: "Bakiye Hareketleri", icon: ScrollText, exact: true },
          { href: "/yonetim/finans/bakiye/yukleme", label: "Bakiye Yükleme", icon: Plus, exact: true },
          { href: "/yonetim/finans/bakiye/transfer", label: "Banka Transferleri", icon: CreditCard, exact: true },
          { href: "/yonetim/finans/bakiye/dusuk", label: "Kritik Bakiyeler", icon: TrendingDown, exact: true },
        ],
      },
      {
        label: "Cari Hesaplar",
        icon: CreditCard,
        children: [
          { href: "/yonetim/finans/cari", label: "Cari Hareketler", icon: CreditCard, exact: true },
          { href: "/yonetim/finans/cari/tahsilatlar", label: "Tahsilatlar", icon: PackageCheck, exact: true },
          { href: "/yonetim/finans/cari/limit", label: "Limit Durumları", icon: ShieldCheck, exact: true },
        ],
      },
    ],
  },
  {
    title: "ENTEGRASYONLAR",
    items: [
      {
        label: "Kargo Firmaları",
        icon: Plug,
        children: [
          { href: "/yonetim/entegrasyonlar/kargo", label: "Tüm Kargo Firmaları", icon: Truck, exact: true },
          { href: "/yonetim/entegrasyonlar/kargo/aras", label: "Aras Kargo", icon: Package, exact: true },
          { href: "/yonetim/entegrasyonlar/kargo/dhl", label: "DHL", icon: Package, exact: true },
          { href: "/yonetim/entegrasyonlar/kargo/hepsijet", label: "HepsiJET", icon: Package, exact: true },
          { href: "/yonetim/entegrasyonlar/kargo/ptt", label: "PTT Kargo", icon: Package, exact: true },
          { href: "/yonetim/entegrasyonlar/kargo/baglanti", label: "Bağlantı Durumları", icon: ShieldCheck, exact: true },
        ],
      },
      {
        label: "SMS / E-posta",
        icon: MessageSquareText,
        children: [
          { href: "/yonetim/bildirimler", label: "Bildirim Ayarları", icon: Settings, exact: true },
          { href: "/yonetim/bildirimler/sms", label: "SMS Gönderimleri", icon: MessageSquareText, exact: true },
          { href: "/yonetim/bildirimler/loglar", label: "SMS Logları", icon: ScrollText, exact: true },
          { href: "/yonetim/bildirimler/sablonlar", label: "Mesaj Şablonları", icon: FileText, exact: true },
          { href: "/yonetim/bildirimler/netgsm", label: "Netgsm Ayarları", icon: Settings, exact: true },
        ],
      },
      {
        label: "Diğer Entegrasyonlar",
        icon: Settings,
        children: [
          { href: "/yonetim/entegrasyonlar", label: "Tüm Entegrasyonlar", icon: Plug, exact: true },
          { href: "/yonetim/entegrasyonlar/api", label: "API Ayarları", icon: Settings, exact: true },
          { href: "/yonetim/entegrasyonlar/webhook", label: "Webhooklar", icon: Plug, exact: true },
          { href: "/yonetim/entegrasyonlar/log", label: "Entegrasyon Logları", icon: ScrollText, exact: true },
        ],
      },
    ],
  },
  {
    title: "SİSTEM",
    items: [
      {
        label: "Ayarlar",
        icon: Settings,
        children: [
          { href: "/yonetim/ayarlar", label: "Genel Ayarlar", icon: Settings, exact: true },
          { href: "/yonetim/ayarlar/firma", label: "Firma Bilgileri", icon: Users, exact: true },
          { href: "/yonetim/ayarlar/operasyon", label: "Operasyon Ayarları", icon: Truck, exact: true },
          { href: "/yonetim/ayarlar/bildirim", label: "Bildirim Ayarları", icon: MessageSquareText, exact: true },
        ],
      },
      {
        label: "Kullanıcı Yönetimi",
        icon: UserCog,
        children: [
          { href: "/yonetim/kullanicilar", label: "Tüm Kullanıcılar", icon: Users, exact: true },
          { href: "/yonetim/kullanicilar/yeni", label: "Yeni Kullanıcı Oluştur", icon: Plus, exact: true },
          { href: "/yonetim/kullanicilar/aktif", label: "Aktif Kullanıcılar", icon: UserCog, exact: true },
          { href: "/yonetim/kullanicilar/pasif", label: "Pasif Kullanıcılar", icon: X, exact: true },
        ],
      },
      {
        label: "Roller & Yetkiler",
        icon: ShieldCheck,
        children: [
          { href: "/yonetim/roller", label: "Roller", icon: ShieldCheck, exact: true },
          { href: "/yonetim/roller/yeni", label: "Yeni Rol Oluştur", icon: Plus, exact: true },
          { href: "/yonetim/roller/matris", label: "Yetki Matrisi", icon: LayoutDashboard, exact: true },
          { href: "/yonetim/roller/atama", label: "Kullanıcı Rol Atamaları", icon: Users, exact: true },
        ],
      },
      {
        label: "Sistem Logları",
        icon: ScrollText,
        children: [
          { href: "/yonetim/audit", label: "Audit Logları", icon: ScrollText, exact: true },
          { href: "/yonetim/audit/islem", label: "İşlem Logları", icon: FileText, exact: true },
          { href: "/yonetim/audit/entegrasyon", label: "Entegrasyon Logları", icon: Plug, exact: true },
          { href: "/yonetim/audit/api", label: "API / Webhook Logları", icon: Settings, exact: true },
          { href: "/yonetim/audit/hata", label: "Hata Logları", icon: X, exact: true },
        ],
      },
    ],
  },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (!href) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ item, pathname, isCollapsed }: { item: any; pathname: string; isCollapsed?: boolean }) {
  if (item.children) {
    const isActiveChild = item.children.some((c: any) => isActive(pathname, c.href, c.exact));
    const [isOpen, setIsOpen] = useState(isActiveChild);

    return (
      <li className="mb-0.5">
        <button
          type="button"
          onClick={() => {
            console.log("Tıklandı! isCollapsed:", isCollapsed, "Mevcut isOpen:", isOpen);
            if (isCollapsed) return;
            setIsOpen(!isOpen);
          }}
          title={isCollapsed ? item.label : undefined}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
            isActiveChild
              ? "bg-slate-800/80 text-white"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
            isCollapsed && "justify-center px-0 h-10"
          )}
        >
          {item.icon && (
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-150",
                isActiveChild ? "text-white" : "text-slate-500 group-hover:text-slate-300"
              )}
            />
          )}
          {!isCollapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
          {!isCollapsed && (
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 transition-transform", isOpen ? "rotate-180 text-slate-300" : "text-slate-500")}
            />
          )}
        </button>
        {(!isCollapsed && isOpen) && (
          <ul className="mt-1 space-y-0.5 pl-6 pb-1">
            {item.children.map((child: any) => {
              const active = isActive(pathname, child.href, child.exact);

              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
                      active
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                    )}
                  >
                    {child.icon && (
                      <child.icon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
                          active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                        )}
                      />
                    )}
                    <span className="flex-1 truncate">{child.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }

  const active = isActive(pathname, item.href, item.exact);

  return (
    <li className="mb-0.5">
      <Link
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
          active
            ? "bg-slate-800/80 text-white"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
          isCollapsed && "justify-center px-0 h-10"
        )}
      >
        {item.icon && (
          <item.icon
            className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-150",
              active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
            )}
          />
        )}
        {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
      </Link>
    </li>
  );
}

function NavContent({ pathname, isCollapsed, toggleCollapse, user }: { pathname: string; isCollapsed?: boolean; toggleCollapse?: () => void; user?: any }) {
  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-slate-800", isCollapsed ? "justify-center px-0" : "px-5 gap-3")}>
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
          <Package className="h-[18px] w-[18px]" />
        </span>
        {!isCollapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold tracking-tight text-white">
              Şimdi Kargoda
            </p>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden space-y-4", isCollapsed ? "p-2" : "p-3 py-5")}>
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                {section.title}
              </h4>
            )}
            <ul>
              {section.items.map((item, itemIdx) => (
                <NavItem key={itemIdx} item={item} pathname={pathname} isCollapsed={isCollapsed} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 p-3">
        {!isCollapsed ? (
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-3 shadow-sm">
            <Link href="/profil" className="flex items-center gap-3 group">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-700">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">
                    {user?.name?.substring(0,2).toUpperCase() || "US"}
                  </div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                  {user?.name ? user.name.split(" (")[0] : "Kullanıcı"}
                </span>
                <span className="truncate text-[11px] font-medium text-slate-500">
                  {user?.role === "admin" ? "Sistem Yöneticisi" : "Müşteri"}
                </span>
              </div>
            </Link>
            <div className="my-3 h-px w-full bg-slate-800" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sistem Aktif</span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 transition hover:text-danger uppercase tracking-wider"
                >
                  <LogOut className="h-3.5 w-3.5 shrink-0" />
                  ÇIKIŞ
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Link href="/profil" className="flex h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-700 hover:border-white/50 transition-colors">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">
                  {user?.name?.substring(0,2).toUpperCase() || "US"}
                </div>
              )}
            </Link>
            <form action={logoutAction}>
               <button type="submit" title="Çıkış Yap" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-danger/10 hover:text-danger transition-colors">
                  <LogOut className="h-5 w-5" />
               </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/** Desktop sidebar — fixed, 256 px veya 80 px genişlik. */
export function Sidebar({ isCollapsed, toggleCollapse, user }: { isCollapsed?: boolean; toggleCollapse?: () => void; user?: any }) {
  const pathname = usePathname();
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-[100] pointer-events-auto hidden flex-col border-r-0 bg-slate-900 shadow-[4px_0_24px_rgba(0,0,0,0.05)] lg:flex transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <NavContent pathname={pathname} isCollapsed={isCollapsed} user={user} />
    </aside>
  );
}

/** Mobil Sidebar Drawer — overlay üstünde açılır. Prop ile kontrol edilir. */
export function MobileSidebar({
  open,
  onClose,
  user
}: {
  open: boolean;
  onClose: () => void;
  user?: any;
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-0 bg-slate-900 shadow-float lg:hidden">
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          aria-label="Menüyü kapat"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Mobilde her zaman tam genişlikte çalışır */}
        <NavContent pathname={pathname} isCollapsed={false} user={user} />
      </aside>
    </>
  );
}
