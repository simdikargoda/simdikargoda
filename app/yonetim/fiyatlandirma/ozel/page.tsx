import { redirect } from "next/navigation";

/**
 * Müşteriye özel fiyatlar, genel fiyatlandırma özetinde (fiyat listesi)
 * müşteri bazlı satırlarla zaten sunulmaktadır. Ayrı bir ekran scope
 * dışıdır; tek doğru veri kaynağına yönlendirilir.
 */
export default async function MusteriyeOzelFiyatlarPage() {
  redirect("/yonetim/fiyatlandirma");
}
