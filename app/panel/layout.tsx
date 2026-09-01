import { redirect } from "next/navigation";
import { LogOut, Package, User } from "lucide-react";
import Link from "next/link";

import { requireAuth } from "@/lib/guard";
import { logoutAction } from "@/app/(auth)/cikis/actions";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAuth();
  if (session.role === "admin") {
    redirect("/yonetim");
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "US";
  return (
    <div className="relative flex min-h-screen flex-col bg-panel-background font-sans text-foreground">
      {/* Basit Müşteri Paneli Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-panel-secondary bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
            <Package className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold tracking-tight text-foreground">
            Müşteri Paneli
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/profil"
            title="Profil"
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-primary/20 hover:shadow-soft"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-sm font-bold text-white">
                {initials}
              </div>
            )}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-10 items-center gap-2 rounded-full border border-panel-secondary bg-white px-4 text-sm font-medium text-muted transition hover:border-danger/20 hover:bg-danger/8 hover:text-danger shadow-sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline-block">Çıkış Yap</span>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
