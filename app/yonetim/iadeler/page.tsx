import ReturnsListPage from "@/components/returns/returns-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TumIadelerPage() {
  await requireAdmin();
  return (
    <ReturnsListPage
      title="Tüm İadeler"
      description="İade durumundaki tüm gönderiler"
      status="returned"
    />
  );
}
