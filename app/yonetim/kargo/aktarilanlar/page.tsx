import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function KargoyaAktarilanlarPage() {
  await requireStaff();
  return (
    <ShipmentListPage
      title="Kargoya Aktarılanlar"
      description="Kargo firmasına aktarılmış ve yolda olan gönderiler"
      status="in_transit"
    />
  );
}
