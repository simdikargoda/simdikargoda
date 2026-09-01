"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileUp, Upload, CheckCircle2, AlertCircle, Download } from "lucide-react";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { uploadExcelAction, type UploadExcelState } from "./actions";
import { FormSection } from "@/components/ui/form-section";

export function ExcelUploadForm({
  customers,
}: {
  customers: { id: string; name: string; type: string }[];
}) {
  const [state, formAction, pending] = useActionState<UploadExcelState, FormData>(
    uploadExcelAction,
    {}
  );
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const downloadTemplate = () => {
    // UTF-8 BOM (\uFEFF) ekliyoruz ki Excel Türkçe karakterleri doğru okusun.
    // Ayrıca Türkiye bölge ayarlarında Excel'in sütunları ayırması için noktalı virgül (;) kullanıyoruz.
    const csvContent = "\uFEFFKargo Firması;Gönderici Adı;Gönderici Telefonu;Gönderici Adresi;Alıcı Adı;Alıcı Telefonu;Alıcı Adresi;Paket Adedi;Desi;Ağırlık;Açıklama\naras;Gönderici AŞ;5550000000;Gönderici Mah. No:1;Örnek Kişi;5551234567;Örnek Mah. Test Sok. No:1;1;1;1;Örnek Açıklama";
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "toplu_kargo_sablonu.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-2xl border border-panel-secondary bg-panel p-5 shadow-sm space-y-6"
      >
        <FormSection title="Kargo Parametreleri">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Müşteri *" name="customerId" required>
              <option value="">Müşteri Seçin</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select label="Kargo Firması *" name="provider" required defaultValue="aras">
              <option value="aras">Aras Kargo</option>
              <option value="dhl">DHL</option>
              <option value="hepsijet">HepsiJET</option>
              <option value="ptt">PTT Kargo</option>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Excel / CSV Dosyası">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Lütfen gönderi bilgilerini içeren dosyayı yükleyin.</p>
              <Button type="button" variant="secondary" size="sm" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Örnek Şablon İndir
              </Button>
            </div>
            
            <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-panel-secondary bg-panel-secondary/20 py-12 transition-colors hover:border-primary/50 hover:bg-primary/5">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <FileUp className="h-6 w-6" />
                </div>
                <div className="text-sm font-medium text-foreground">
                  {fileName ? fileName : "Dosya seçmek için tıklayın"}
                </div>
                {!fileName && (
                  <p className="text-xs text-muted">.xlsx veya .csv (Maks 5MB)</p>
                )}
              </div>
              <input
                type="file"
                name="file"
                className="hidden"
                accept=".xlsx,.csv"
                required
                onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
              />
            </label>
          </div>
        </FormSection>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={pending} className="gap-2">
            <Upload className="h-4 w-4" />
            Toplu Kargo Oluştur
          </Button>
        </div>
      </form>

      {state.success && state.results && (
        <div className="rounded-2xl border border-success/20 bg-success/5 p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-success">
            <CheckCircle2 className="h-5 w-5" />
            İşlem Tamamlandı
          </h3>
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <div className="rounded-xl bg-panel p-4 shadow-sm">
              <p className="text-sm text-muted">Toplam Satır</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{state.results.total}</p>
            </div>
            <div className="rounded-xl bg-panel p-4 shadow-sm">
              <p className="text-sm text-muted">Başarılı</p>
              <p className="mt-1 text-2xl font-semibold text-success">{state.results.successful}</p>
            </div>
            <div className="rounded-xl bg-panel p-4 shadow-sm">
              <p className="text-sm text-muted">Hatalı</p>
              <p className="mt-1 text-2xl font-semibold text-destructive">{state.results.failed}</p>
            </div>
          </div>
          
          {state.results.errors.length > 0 && (
            <div className="rounded-xl bg-panel p-4 shadow-sm">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                Hata Detayları
              </h4>
              <ul className="max-h-40 overflow-y-auto space-y-2 text-sm">
                {state.results.errors.map((err, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-medium min-w-[60px]">Satır {err.row}:</span>
                    <span className="text-muted-foreground">{err.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
