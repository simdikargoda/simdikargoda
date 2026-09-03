import { requireAdmin } from "@/lib/guard";
import { getCustomerOptions } from "@/lib/queries/customer.queries";
import NewShipmentForm from "./new-shipment-form";

export const dynamic = "force-dynamic";

export default async function YeniKargoPage() {
  await requireAdmin();
  const customers = await getCustomerOptions();

  return (
    <div>
      <NewShipmentForm customers={customers.map((c) => ({ ...c, type: c.type as string }))} />
    </div>
  );
}
