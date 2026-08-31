import { describe, expect, it } from "vitest";

import { formatKurus, kurusToTl, tlToKurus } from "@/lib/money";

describe("lib/money", () => {
  it("tlToKurus tam kuruşa çevirir", () => {
    expect(tlToKurus(100)).toBe(10000);
    expect(tlToKurus(23.28914)).toBe(2329);
    expect(tlToKurus(0)).toBe(0);
  });

  it("kurusToTl geri çevirir", () => {
    expect(kurusToTl(10000)).toBe(100);
  });

  it("formatKurus Türkçe ₺ formatı üretir", () => {
    expect(formatKurus(232914)).toContain("₺");
    expect(formatKurus(232914)).toContain("2");
    expect(formatKurus(232914)).toContain("329,14");
  });

  it("Geçersiz değerlerde tlToKurus hata fırlatır", () => {
    expect(() => tlToKurus(Number.NaN)).toThrow();
    expect(() => tlToKurus(Infinity)).toThrow();
  });
});
