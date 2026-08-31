import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/guard";

export const dynamic = "force-dynamic";

/**
 * Firma bilgileri şu anda genel ayarlar ekranındaki entegrasyon durumu ile
 * yönetilir; ayrı bir firma bilgi formu scope dışıdır (persisted settings
 * modeli yok). Duplicate ekran üretilmez.
 */
export default async function FirmaBilgileriPage() {
  await requireStaff();
  redirect("/yonetim/ayarlar");
}
