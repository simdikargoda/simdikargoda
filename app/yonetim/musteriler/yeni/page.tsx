import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Yeni müşteri oluşturma, müşteri listesi üzerindeki modal ile yapılır
 * (NewCustomerButton). Ayrı bir rota yerine listeye yönlendirir.
 */
export default async function YeniMusteriOlusturPage() {
  await requireStaff();
  redirect("/yonetim/musteriler");
}
