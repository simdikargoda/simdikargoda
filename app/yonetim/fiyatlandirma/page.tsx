import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Tags } from "lucide-react";

export const dynamic = "force-dynamic";

export default function FiyatlandirmaPage() {
  return (
    <div>
      <PageHeader
        title="Fiyatlandırma"
        description="Müşterilere ve kargo firmalarına özel fiyat tarifelerini yönetin."
      />
      <div className="mt-4">
        <EmptyState
          icon={Tags}
          title="Fiyat Listesi Yapılandırılıyor"
          description="Kargo firmalarına özel fiyat şablonları ve müşteri atamaları çok yakında eklenecek."
        />
      </div>
    </div>
  );
}
