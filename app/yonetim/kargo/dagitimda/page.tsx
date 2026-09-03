import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function DagitimdaPage() {
  await requireAdmin();
  return (
    <ShipmentListPage
      title="Dağıtımda"
      description="Dağıtım aşamasındaki gönderiler"
      status="in_transit"
    />
  );
}
