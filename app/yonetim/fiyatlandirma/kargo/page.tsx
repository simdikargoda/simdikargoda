import { redirect } from "next/navigation";

/**
 * Kargo firması tarifeleri, genel fiyatlandırma özetinde kargo firması
 * bazlı satırlarla sunulur. Ayrı ekran oluşturulmaz.
 */
export default async function KargoFirmasiTarifeleriPage() {
  redirect("/yonetim/fiyatlandirma");
}
