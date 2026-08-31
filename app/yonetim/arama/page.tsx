import { PageHeader } from "@/components/ui/page-header";
import { Search, Package, Users } from "lucide-react";

export default async function AramaSonuclariPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q || "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`"${query}" için Arama Sonuçları`}
        description="Müşteri, kargo veya takip numarası eşleşmeleri"
      />

      {query ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-panel-secondary bg-panel p-12 text-center shadow-sm">
          <div className="rounded-full bg-primary/10 p-4 text-primary mb-4 flex items-center justify-center">
             <Search className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Arama Modülü Hazırlanıyor</h3>
          <p className="mt-2 text-sm text-muted max-w-md">
            Şu anda "{query}" sorgusu için veritabanı endeksleme altyapısı kurulmaktadır.
            Çok yakında saniyeler içinde tüm sistemde arama yapabileceksiniz.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-panel-secondary bg-panel p-12 text-center shadow-sm">
          <p className="text-sm text-muted max-w-md">
            Lütfen arama yapmak için üst kısımdaki çubuğu kullanın.
          </p>
        </div>
      )}
    </div>
  );
}
