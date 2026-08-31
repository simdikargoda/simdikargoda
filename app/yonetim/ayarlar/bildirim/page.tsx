import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Bildirim ayarları, /yonetim/bildirimler altında tekilleştirilmiştir.
 * Bu rota duplicate yerine bildirim ekranına yönlendirilir.
 */
export default async function AyarlarBildirimPage() {
  await requireStaff();
  redirect("/yonetim/bildirimler/sms");
}
