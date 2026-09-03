import ReturnsListPage from "@/components/returns/returns-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TamamlananIadelerPage() {
  await requireAdmin();
  return (
    <ReturnsListPage
      title="Tamamlanan İadeler"
      description="Sonuçlanmış iade gönderileri"
      status="delivered"
    />
  );
}
