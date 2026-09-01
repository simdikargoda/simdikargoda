/**
 * Para birimi yardımcıları.
 * DB'de parayı kuruş hassasiyetli INTEGER olarak saklarız;
 * gösterim ve hesaplamalarda float kullanmayız.
 */

/** TL -> kuruş (önemli: backend'e TL gelen değeri kuruşa çevirir). */
export function tlToKurus(tl: number): number {
  if (!Number.isFinite(tl)) {
    throw new Error("Geçersiz para tutarı.");
  }
  // Kayan nokta hatalarını önlemek için en yakın tam kuruşa yuvarla.
  return Math.round(tl * 100);
}

/** Kuruş -> TL (sadece gösterim/letim için). */
export function kurusToTl(kurus: number): number {
  return kurus / 100;
}

/** Kuruş değerini Türkçe ₺ formatında biçimlendirir. */
export function formatKurus(kurus: number): string {
  const formatter = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  });
  return formatter.format(kurus / 100);
}
