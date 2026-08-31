import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Check, Minus } from "lucide-react";

export const metadata = {
  title: "Yetki Matrisi | Şimdi Kargoda",
};

export default function YetkiMatrisiPage() {
  const roles = [
    { id: "admin", name: "Sistem Yöneticisi", color: "text-rose-600 bg-rose-50" },
    { id: "customer", name: "Müşteri (Standart)", color: "text-emerald-600 bg-emerald-50" },
  ];

  const permissions = [
    { module: "Gönderi Yönetimi", actions: [
      { name: "Gönderi Oluşturma", admin: true, customer: true },
      { name: "Toplu Gönderi Yükleme", admin: true, customer: true },
      { name: "Gönderi İptali", admin: true, customer: false },
      { name: "Tüm Gönderileri Görüntüleme", admin: true, customer: false },
    ]},
    { module: "Finans & Bakiye", actions: [
      { name: "Bakiye Yükleme", admin: true, customer: true },
      { name: "Bakiye İadesi Yapma", admin: true, customer: false },
      { name: "Tüm Finansal Raporları Görme", admin: true, customer: false },
    ]},
    { module: "Kullanıcı & Roller", actions: [
      { name: "Kullanıcı Ekleme / Silme", admin: true, customer: false },
      { name: "Rol Ataması Yapma", admin: true, customer: false },
      { name: "Yetki Matrisini Düzenleme", admin: true, customer: false },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Yetki Matrisi"
          description="Kullanıcı rollerinin sistem modülleri üzerindeki erişim izinleri"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-panel-secondary bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="border-b border-panel-secondary bg-panel text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/3">Modül ve İzinler</th>
                {roles.map(role => (
                  <th key={role.id} className="px-6 py-4 font-semibold text-center w-2/9">
                    <span className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 ${role.color}`}>
                      {role.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-secondary">
              {permissions.map((group, gIdx) => (
                <React.Fragment key={gIdx}>
                  {/* Kategori Başlığı */}
                  <tr className="bg-panel/50">
                    <td colSpan={3} className="px-6 py-3 font-bold text-foreground">
                      {group.module}
                    </td>
                  </tr>
                  {/* İzin Satırları */}
                  {group.actions.map((action, aIdx) => (
                    <tr key={aIdx} className="group hover:bg-panel-secondary/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-muted">
                        {action.name}
                      </td>
                      <td className="px-6 py-3 text-center">
                        {action.admin ? (
                          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="mx-auto flex h-6 w-6 items-center justify-center text-muted/30">
                            <Minus className="h-4 w-4" />
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-3 text-center">
                        {action.customer ? (
                          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="mx-auto flex h-6 w-6 items-center justify-center text-muted/30">
                            <Minus className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
