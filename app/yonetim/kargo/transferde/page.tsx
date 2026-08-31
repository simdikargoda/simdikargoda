import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TransferdePage() {
  await requireStaff();
  return (
    <ShipmentListPage
      title="Transferde"
      description="Transfer/aktarım sürecindeki gönderiler"
      status="in_transit"
    />
  );
}
