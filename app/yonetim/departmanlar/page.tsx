import { PageHeader } from "@/components/ui/page-header";
import { getDepartments } from "@/lib/queries/department.queries";
import { requireAdmin } from "@/lib/guard";
import { DepartmentsTable } from "./departments-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DepartmanlarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  
  const depts = await getDepartments();
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";

  const filtered = depts.filter((d) => {
    if (q) {
      const haystack = `${d.name} ${d.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Departman Yönetimi"
        description="Sistemdeki tüm departmanları ve görev dağılımlarını yönetin."
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Departman
          </Button>
        }
      />
      <DepartmentsTable departments={filtered} initialQ={q} />
    </div>
  );
}
