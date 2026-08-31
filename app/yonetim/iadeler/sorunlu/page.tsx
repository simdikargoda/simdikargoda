import ReturnsListPage from "@/components/returns/returns-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SorunluIadelerPage() {
  await requireStaff();
  return (
    <ReturnsListPage
      title="Sorunlu İadeler"
      description="Tespit edilen sorunlu iade gönderileri"
      status="issue"
    />
  );
}
