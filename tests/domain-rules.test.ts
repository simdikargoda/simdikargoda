import { describe, expect, it } from "vitest";

import { normalizeStatus } from "@/lib/providers/cargo/status-map";
import { validateImportRow, type ImportRowRaw } from "@/lib/services/shipment/excel-import.service";

describe("provider durum normalizasyonu", () => {
  it("Aras ham durum kodlarını ortak modele eşler", () => {
    expect(normalizeStatus("01", "aras")).toBe("in_transit");
    expect(normalizeStatus("03", "aras")).toBe("delivered");
    expect(normalizeStatus("05", "aras")).toBe("issue");
    expect(normalizeStatus("06", "aras")).toBe("returned");
  });

  it("DHL ham durumlarını eşler", () => {
    expect(normalizeStatus("delivered", "dhl")).toBe("delivered");
    expect(normalizeStatus("transit", "dhl")).toBe("in_transit");
    expect(normalizeStatus("exception", "dhl")).toBe("issue");
  });

  it("PTT ham durumlarını eşler", () => {
    expect(normalizeStatus("3", "ptt")).toBe("delivered");
    expect(normalizeStatus("1", "ptt")).toBe("in_transit");
    expect(normalizeStatus("4", "ptt")).toBe("issue");
  });

  it("bilinmeyen durumu güvenli varsayılana yedekler", () => {
    expect(normalizeStatus("unknown", "ptt")).toBe("pending");
    expect(normalizeStatus("", "aras")).toBe("pending");
  });

  it("büyük/küçük harf duyarsızdır", () => {
    expect(normalizeStatus("DELIVERED", "dhl")).toBe("delivered");
  });
});

describe("Excel satır doğrulama", () => {
  const validRow: ImportRowRaw = {
    rowNumber: 2,
    provider: "aras",
    senderName: "Gönderici A",
    senderPhone: "05320000000",
    senderAddress: "Cadde Sokak No 1",
    receiverName: "Alıcı B",
    receiverPhone: "05320000001",
    receiverAddress: "Başka Cadde No 2",
    packageCount: "1",
    desi: "3",
    weight: "2",
  };

  it("geçerli satırda hata üretmez", () => {
    expect(validateImportRow(validRow)).toHaveLength(0);
  });

  it("zorunlu alan eksikse hata verir", () => {
    const errors = validateImportRow({ ...validRow, receiverPhone: "" });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.join(" ")).toContain("alıcı telefon");
  });

  it("negatif/sıfır paket adedini reddeder", () => {
    const errors = validateImportRow({ ...validRow, packageCount: "0" });
    expect(errors.join(" ")).toContain("paket adedi");
  });

  it("negatif ağırlığı reddeder", () => {
    const errors = validateImportRow({ ...validRow, weight: "-1" });
    expect(errors.join(" ")).toContain("ağırlık");
  });

  it("birden çok hatayı toplar (tek satır hatası dosyayı bozmaz)", () => {
    const errors = validateImportRow({
      ...validRow,
      receiverName: "",
      receiverAddress: "",
    });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
