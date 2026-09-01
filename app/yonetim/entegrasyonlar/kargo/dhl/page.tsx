import { redirect } from "next/navigation";

/**
 * DHL detayı genel kargo entegrasyonları ekranından izlenir.
 * Resmi API dokümanı temin edilene kadar gerçek konfigürasyon formu
 * scope dışıdır.
 */
export default async function DhlPage() {
  redirect("/yonetim/entegrasyonlar/kargo");
}
