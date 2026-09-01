import { redirect } from "next/navigation";

/**
 * Aras Kargo detayı, genel kargo entegrasyonları ekranından izlenir.
 * Resmi API dokümanı temin edilene kadar gerçek konfigürasyon formu
 * scope dışıdır.
 */
export default async function ArasKargoPage() {
  await Promise.resolve();
  redirect("/yonetim/entegrasyonlar/kargo");
}
