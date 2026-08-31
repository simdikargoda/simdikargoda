import ReturnsListPage from "@/components/returns/returns-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function IadeSurecindekilerPage() {
  await requireStaff();
  return (
    <ReturnsListPage
      title="İade Sürecindekiler"
      description="İade süreci devam eden gönderiler"
      status="returned"
    />
  );
}
