import { PageHeader } from "@/components/ui/page-header";
import { requireStaff } from "@/lib/guard";
import { getDb } from "@/db/client";
import { TemplateList } from "./template-list";
import { createDefaultTemplates } from "./actions";

export const dynamic = "force-dynamic";

export default async function MesajSablonlarPage() {
  await requireStaff();
  const db = getDb();

  // Şablonları getir, yoksa oluştur
  let templates = await db.query.smsTemplates.findMany({
    orderBy: (t, { asc }) => [asc(t.createdAt)]
  });

  if (templates.length === 0) {
    await createDefaultTemplates();
    templates = await db.query.smsTemplates.findMany({
      orderBy: (t, { asc }) => [asc(t.createdAt)]
    });
  }

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <PageHeader 
        title="Mesaj Şablonları" 
        description="Müşterilerinize gönderilecek otomatik bildirim mesajlarını (SMS) yönetin." 
      />

      {templates.length > 0 ? (
        <TemplateList templates={templates} />
      ) : (
        <div className="rounded-[24px] border border-panel-secondary bg-white p-8 shadow-soft text-center space-y-4 mt-6">
          <p className="text-muted">Şablon bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
