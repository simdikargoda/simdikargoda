import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SorunluGonderilerPage() {
  await requireStaff();
  return (
    <ShipmentListPage
      title="Sorunlu Gönderiler"
      description="Tespit edilen sorunlu gönderiler"
      status="issue"
    />
  );
}
