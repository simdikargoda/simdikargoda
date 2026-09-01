import { redirect } from "next/navigation";

/**
 * HepsiJET detayı genel kargo entegrasyonları ekranından izlenir.
 * Resmi API dokümanı temin edilene kadar gerçek konfigürasyon formu
 * scope dışıdır.
 */
export default async function HepsiJetPage() {
  redirect("/yonetim/entegrasyonlar/kargo");
}
