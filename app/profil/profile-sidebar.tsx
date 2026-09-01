"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, User, MonitorSmartphone, Activity } from "lucide-react";
import { cn } from "@/lib/cn";

const links = [
  { href: "/profil", label: "Profil Bilgileri", icon: User },
  { href: "/profil/guvenlik", label: "Hesap & Güvenlik", icon: ShieldCheck },
  { href: "/profil/oturumlar", label: "Oturum Yönetimi", icon: MonitorSmartphone },
  { href: "/profil/aktivite", label: "Güvenlik Aktivitesi", icon: Activity },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-white shadow-soft"
                : "text-muted hover:bg-panel-secondary hover:text-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted")} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
