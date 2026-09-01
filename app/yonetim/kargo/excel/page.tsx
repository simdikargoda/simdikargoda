import { requireStaff } from "@/lib/guard";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema/customer";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/ui/page-header";
import { ExcelUploadForm } from "./excel-upload-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TopluKargoExcelPage() {
  await requireStaff();

  const db = getDb();
  const customerList = await db.query.customers.findMany({
    where: eq(customers.status, "active"),
    columns: { id: true, name: true, type: true },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/yonetim/kargo"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kargolar
      </Link>

      <PageHeader
        title="Toplu Kargo Yükleme"
        description="Excel veya CSV dosyası yükleyerek tek seferde birden fazla kargo oluşturun."
      />

      <ExcelUploadForm customers={customerList} />
    </div>
  );
}
