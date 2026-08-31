import { requireAuth } from "@/lib/guard";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { PanelHeader } from "@/components/layout/panel-header";
import { LogOut, Package } from "lucide-react";
import { logoutAction } from "@/app/(auth)/cikis/actions";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";


export default async function ProfilRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const profileContent = (
    <div className="mx-auto max-w-6xl">
      {children}
    </div>
  );

  // Yönetici / Operasyon Görünümü
  if (session.role === "admin") {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    const safeUser = user ? {
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    } : undefined;

    return (
      <SidebarLayout user={safeUser}>
        <PanelHeader user={safeUser} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {profileContent}
        </main>
      </SidebarLayout>
    );
  }

  // Müşteri Görünümü
  return (
    <div className="relative flex min-h-screen flex-col bg-panel-background font-sans text-foreground">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-panel-secondary bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
            <Package className="h-5 w-5" />
          </span>
          <p className="text-sm font-bold tracking-tight text-foreground">
            Müşteri Paneli
          </p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex h-9 items-center gap-2 rounded-xl border border-panel-secondary px-3 text-sm font-medium text-muted transition hover:border-danger/20 hover:bg-danger/8 hover:text-danger"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline-block">Çıkış Yap</span>
          </button>
        </form>
      </header>
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {profileContent}
      </main>
    </div>
  );
}
