import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function TeslimEdilenlerPage() {
  await requireAdmin();
  return (
    <ShipmentListPage
      title="Teslim Edilenler"
      description="Teslim edilmiş gönderiler"
      status="delivered"
    />
  );
}
