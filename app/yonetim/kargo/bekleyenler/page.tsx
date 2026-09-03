import ShipmentListPage from "@/components/shipments/shipment-list-page";
import { requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function BekleyenlerPage() {
  await requireAdmin();
  return (
    <ShipmentListPage
      title="Bekleyenler"
      description="İşlem bekleyen gönderiler"
      status="pending"
    />
  );
}
