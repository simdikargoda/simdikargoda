"use server";

import ExcelJS from "exceljs";
import { requireStaff, assertCustomerScope } from "@/lib/guard";
import { createShipment } from "@/lib/services/shipment/create-shipment.service";
import { getCustomerWithAccounts } from "@/lib/services/customer.service";
import { z } from "zod";
import { AppError } from "@/lib/errors";

const rowSchema = z.object({
  receiverName: z.string({ required_error: "Alıcı adı zorunludur" }).min(2, "Alıcı adı en az 2 karakter olmalıdır"),
  receiverPhone: z.string({ required_error: "Alıcı telefonu zorunludur" }).min(7, "Alıcı telefonu en az 7 karakter olmalıdır"),
  receiverAddress: z.string({ required_error: "Alıcı adresi zorunludur" }).min(5, "Alıcı adresi en az 5 karakter olmalıdır"),
  receiverCity: z.string().optional(),
  receiverDistrict: z.string().optional(),
  packageCount: z.coerce.number({ invalid_type_error: "Paket sayısı geçerli bir sayı olmalıdır" }).int().min(1, "Paket sayısı en az 1 olmalıdır"),
  desi: z.coerce.number({ invalid_type_error: "Desi geçerli bir sayı olmalıdır" }).int().min(1, "Desi en az 1 olmalıdır"),
  weight: z.coerce.number({ invalid_type_error: "Ağırlık geçerli bir sayı olmalıdır" }).int().min(1, "Ağırlık en az 1 olmalıdır"),
  description: z.string().optional(),
});

export type UploadExcelState = {
  error?: string;
  success?: boolean;
  results?: {
    total: number;
    successful: number;
    failed: number;
    errors: { row: number; error: string }[];
  };
};

export async function uploadExcelAction(
  _prev: UploadExcelState,
  formData: FormData
): Promise<UploadExcelState> {
  const session = await requireStaff();

  try {

    const customerId = formData.get("customerId")?.toString();
    const provider = formData.get("provider")?.toString();
    const file = formData.get("file") as File | null;

    if (!customerId || !provider || !file) {
      return { error: "Müşteri, kargo firması ve dosya seçimi zorunludur." };
    }

    assertCustomerScope(customerId, session);

    if (file.size > 5 * 1024 * 1024) {
      return { error: "Dosya boyutu en fazla 5MB olabilir." };
    }

    const customerData = await getCustomerWithAccounts(customerId);
    const senderName = customerData.customer.name;
    const senderPhone = customerData.customer.phone;
    const senderAddress = customerData.customer.address || "-";

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      const csvData = await file.text();
      // Yüklenen template'te ilk satır başlık olduğu için direkt parse edip ilk sheet'e atar.
      // Ancak ; ile ayrıldığını belirtmemiz lazım.
      // @ts-ignore
      await workbook.csv.read(require('stream').Readable.from([csvData]), { sheetName: 'Sheet1', delimiter: ';' });
    } else {
      await workbook.xlsx.load(buffer as any);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return { error: "Excel dosyasında sayfa bulunamadı." };
    }

    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
    };

    // Assuming first row is header, start from second row
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);
      
      // Stop if row is completely empty
      if (!row.hasValues) continue;
      
      results.total++;

      const rawData = {
        receiverName: row.getCell(1).text,
        receiverPhone: row.getCell(2).text,
        receiverAddress: row.getCell(3).text,
        receiverCity: row.getCell(4).text,
        receiverDistrict: row.getCell(5).text,
        packageCount: row.getCell(6).value ?? 1,
        desi: row.getCell(7).value ?? 1,
        weight: row.getCell(8).value ?? 1,
        description: row.getCell(9).text,
      };

      const parsed = rowSchema.safeParse(rawData);

      if (!parsed.success) {
        results.failed++;
        results.errors.push({
          row: i,
          error: parsed.error.issues.map((issue) => issue.message).join(", "),
        });
        continue;
      }

      try {
        const idempotencyKey = `excel:${session.userId}:${Date.now()}:${customerId}:${parsed.data.receiverPhone}:${i}`;
        
        await createShipment({
          customerId,
          provider: provider as any,
          senderName,
          senderPhone,
          senderAddress,
          ...parsed.data,
          idempotencyKey,
        });
        
        results.successful++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({
          row: i,
          error: err.message || "Bilinmeyen sunucu hatası.",
        });
      }
    }

    return { success: true, results };
  } catch (error: any) {
    if (error instanceof AppError || error.message) {
      return { error: error.message || "İşlem sırasında bir hata oluştu." };
    }
    return { error: "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin." };
  }
}
