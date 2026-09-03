import ReturnsListPage from "@/components/returns/returns-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SorunluIadelerPage() {
  await requireAdmin();
  return (
    <ReturnsListPage
      title="Sorunlu İadeler"
      description="Tespit edilen sorunlu iade gönderileri"
      status="issue"
    />
  );
}
