import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TeslimEdilenlerPage() {
  await requireStaff();
  return (
    <ShipmentListPage
      title="Teslim Edilenler"
      description="Teslim edilmiş gönderiler"
      status="delivered"
    />
  );
}
