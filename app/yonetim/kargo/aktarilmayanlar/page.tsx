import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function KargoyaAktarilmayanlarPage() {
  await requireAdmin();
  return (
    <ShipmentListPage
      title="Kargoya Aktarılmayanlar"
      description="Oluşturulmuş fakat henüz kargo firmasına aktarılmamış gönderiler"
      status="created"
    />
  );
}
