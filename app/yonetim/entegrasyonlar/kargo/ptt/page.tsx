import { redirect } from "next/navigation";

/**
 * PTT Kargo detayı genel kargo entegrasyonları ekranından izlenir.
 * Resmi API dokümanı temin edilene kadar gerçek konfigürasyon formu
 * scope dışıdır.
 */
export default async function PtKargoPage() {
  redirect("/yonetim/entegrasyonlar/kargo");
}
