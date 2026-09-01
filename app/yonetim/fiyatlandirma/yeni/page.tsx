import { redirect } from "next/navigation";

/**
 * Yeni fiyat listesi oluşturma akışı; şablon oluşturma bu sürümde
 * fiyat özet ekranı üzerinden yürütülür. Ayrı bir oluşturma formu
 * scope dışı tutulmuştur; kopyalanmış ekran üretilmez.
 */
export default async function YeniFiyatListesiPage() {
  redirect("/yonetim/fiyatlandirma");
}
