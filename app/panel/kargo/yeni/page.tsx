import { requireAuth } from "@/lib/guard";
import NewCustomerShipmentForm from "./new-shipment-form";

export const dynamic = "force-dynamic";

export default async function YeniKargoPage() {
  await requireAuth();

  return (
    <div className="mx-auto max-w-4xl">
      <NewCustomerShipmentForm />
    </div>
  );
}
