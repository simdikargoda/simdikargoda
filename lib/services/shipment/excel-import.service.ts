import "server-only";

import ExcelJS from "exceljs";

import { AppError } from "@/lib/errors";
import type { CargoProvider } from "@/lib/services/pricing.service";

/**
 * Excel ile toplu kargo yükleme.
 *
 * - Dosya/satır doğrulama
 * - Hatalı satırları tek tek raporlama (tek satır hatası tüm dosyayı bozmaz)
 * - Geçerli satırları işleme
 * - Duplicate shipment oluşumunu önleme (her satır için determinant idempotency key)
 */

export interface ImportRowRaw {
  rowNumber: number; // 1 tabanlık dosya satırı (başlık dahil)
  provider: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  packageCount: string;
  desi: string;
  weight: string;
  description?: string;
}

export interface ImportRowResult {
  rowNumber: number;
  ok: boolean;
  error?: string;
  /** İşlenen gönderi idempotency key'i */
  idempotencyKey?: string;
}

export interface ImportSummary {
  total: number;
  success: number;
  failed: number;
  rows: ImportRowResult[];
}

/** Basit satır doğrulayıcı — mutation için satır içi zorunlu alanlar. */
export function validateImportRow(raw: ImportRowRaw): string[] {
  const errors: string[] = [];
  if (!raw.provider) errors.push("provider gerekli");
  if (!raw.senderName || !raw.senderName.trim()) errors.push("gönderici adı gerekli");
  if (!raw.senderPhone || !raw.senderPhone.trim()) errors.push("gönderici telefon gerekli");
  if (!raw.senderAddress || !raw.senderAddress.trim()) errors.push("gönderici adres gerekli");
  if (!raw.receiverName || !raw.receiverName.trim()) errors.push("alıcı adı gerekli");
  if (!raw.receiverPhone || !raw.receiverPhone.trim()) errors.push("alıcı telefon gerekli");
  if (!raw.receiverAddress || !raw.receiverAddress.trim()) errors.push("alıcı adres gerekli");
  if (!Number.isFinite(Number(raw.packageCount)) || Number(raw.packageCount) < 1)
    errors.push("paket adedi geçersiz");
  if (!Number.isFinite(Number(raw.desi)) || Number(raw.desi) < 1) errors.push("desi geçersiz");
  if (!Number.isFinite(Number(raw.weight)) || Number(raw.weight) < 1) errors.push("ağırlık geçersiz");
  return errors;
}

const ALLOWED_PROVIDERS = ["aras", "dhl", "hepsijet", "ptt"];

/**
 * XLSX buffer'ını parse eder ve ham satırlara çevirir.
 * Beklenen başlık sütunları (sıra önemli değil, isim eşleşmesi):
 * provider, senderName, senderPhone, senderAddress, receiverName,
 * receiverPhone, receiverAddress, packageCount, desi, weight, description
 */
export async function parseShipmentWorkbook(buffer: ArrayBuffer): Promise<ImportRowRaw[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new AppError("VALIDATION_ERROR", "Excel dosyasında çalışma sayfası bulunamadı.", 400);
  }

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell, col) => {
    headers[col - 1] = String(cell.value ?? "").toLowerCase();
  });

  const col = (names: string[]) => {
    for (const n of names) {
      const idx = headers.findIndex(h => h === n || h === n.replace(/\s+/g, ''));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  const rows: ImportRowRaw[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // başlığı atla
    const get = (names: string[]) => {
      const idx = col(names);
      if (idx < 0) return "";
      return row.getCell(idx + 1).value != null ? String(row.getCell(idx + 1).value).trim() : "";
    };
    rows.push({
      rowNumber,
      provider: get(["provider", "kargofirması", "kargo firması", "kargo", "kargofirmasi"]),
      senderName: get(["sendername", "göndericiadı", "gönderici adı", "gondericiadi"]),
      senderPhone: get(["senderphone", "göndericitelefonu", "gönderici telefonu", "gondericitelefonu"]),
      senderAddress: get(["senderaddress", "göndericiadresi", "gönderici adresi", "gondericiadresi"]),
      receiverName: get(["receivername", "alıcıadı", "alıcı adı", "aliciadi"]),
      receiverPhone: get(["receiverphone", "alıcıtelefonu", "alıcı telefonu", "alicitelefonu"]),
      receiverAddress: get(["receiveraddress", "alıcıadresi", "alıcı adresi", "aliciadresi"]),
      packageCount: get(["packagecount", "paketadedi", "paket adedi", "adet"]),
      desi: get(["desi", "hacim"]),
      weight: get(["weight", "ağırlık", "agirlik"]),
      description: get(["description", "açıklama", "aciklama", "not"]) || undefined,
    });
  });

  return rows;
}

/**
 * Toplu işlemi yürütür. `processRow` callback'i gerçek gönderi oluşturmayı
 * (createShipment) içerir; her satır ayrı ayrı try/catch içinde çalıştırılır,
 * böylece tek satır hatası tüm dosyayı bozmaz.
 *
 * Idempotency: Her satır için customerId + provider + receiverPhone +
 * gönderi benzersizliğini garanti eden deterministik anahtar üretilir.
 */
export async function runShipmentImport(input: {
  customerId: string;
  provider: CargoProvider;
  rows: ImportRowRaw[];
  processRow: (args: {
    row: ImportRowRaw;
    customerId: string;
    provider: CargoProvider;
    idempotencyKey: string;
  }) => Promise<void>;
}): Promise<ImportSummary> {
  const summary: ImportSummary = { total: input.rows.length, success: 0, failed: 0, rows: [] };

  for (const raw of input.rows) {
    // Provider eşleşmesi: satırdaki provider yoksa dosya seviyesindeki provider kullanılır.
    const rowProvider = ALLOWED_PROVIDERS.includes(raw.provider)
      ? (raw.provider as CargoProvider)
      : input.provider;

    const errors = validateImportRow({ ...raw, provider: rowProvider });
    if (errors.length > 0) {
      summary.failed += 1;
      summary.rows.push({ rowNumber: raw.rowNumber, ok: false, error: errors.join("; ") });
      continue;
    }

    const idempotencyKey = [
      "shipment-import",
      input.customerId,
      rowProvider,
      raw.rowNumber,
      raw.receiverPhone,
      raw.senderPhone,
    ].join(":");

    try {
      await input.processRow({ row: raw, customerId: input.customerId, provider: rowProvider, idempotencyKey });
      summary.success += 1;
      summary.rows.push({ rowNumber: raw.rowNumber, ok: true, idempotencyKey });
    } catch (err) {
      summary.failed += 1;
      summary.rows.push({
        rowNumber: raw.rowNumber,
        ok: false,
        error: err instanceof AppError ? err.message : "Satır işlenemedi",
        idempotencyKey,
      });
    }
  }

  return summary;
}
