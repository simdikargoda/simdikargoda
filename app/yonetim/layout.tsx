import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guard";
import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { PanelHeader } from "@/components/layout/panel-header";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export default async function YonetimLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Yönetici/operasyon erişimi zorunlu.
  const session = await requireStaff();

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
      {/* Sticky header */}
      <PanelHeader user={safeUser} />

      {/* Sayfa içeriği */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </SidebarLayout>
  );
}
