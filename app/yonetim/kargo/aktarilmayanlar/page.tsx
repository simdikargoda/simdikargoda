import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function KargoyaAktarilmayanlarPage() {
  await requireStaff();
  return (
    <ShipmentListPage
      title="Kargoya Aktarılmayanlar"
      description="Oluşturulmuş fakat henüz kargo firmasına aktarılmamış gönderiler"
      status="created"
    />
  );
}
