import { DashboardClient } from "@/components/widgets/dashboard-client";
import { getAdminDashboardData } from "@/lib/services/reports/reports.service";
import { requireAdmin } from "@/lib/guard";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "Yönetim Paneli | Şimdi Kargoda",
  description: "Kargo operasyonları yönetim paneli",
};

export default async function YonetimDashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const range = sp.range || "Bugün";
  const data = await getAdminDashboardData(range);

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    columns: { name: true },
  });

  return (
    <DashboardClient data={data} initialRange={range} userName={user?.name || "Kullanıcı"} />
  );
}
