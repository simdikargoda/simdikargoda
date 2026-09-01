import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Mesaj şablonları: Sistem şu anda sabit şablon kullanır (kargo oluşturma
 * SMS'i). Kullanıcı tanımlı template CRUD'u scope dışıdır; duplicate bir
 * şablon yönetimi üretilmez. Bu rota SMS gönderimlerine yönlendirilir.
 */
export default async function MesajSablonlarPage() {
  await requireStaff();
  redirect("/yonetim/bildirimler/sms");
}
