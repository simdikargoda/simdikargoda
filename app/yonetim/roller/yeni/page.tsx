"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Save, Shield, Check, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const MODULES = [
  {
    id: "dashboard",
    name: "Panel (Dashboard)",
    actions: ["Görüntüleme"],
  },
  {
    id: "shipments",
    name: "Kargo Operasyonları",
    actions: ["Görüntüleme", "Yeni Kayıt", "Düzenleme", "Silme"],
  },
  {
    id: "bulk_shipments",
    name: "Toplu Kargo (Excel)",
    actions: ["Görüntüleme", "Yeni Kayıt", "Düzenleme", "Silme"],
  },
  {
    id: "customers",
    name: "Müşteri Yönetimi",
    actions: ["Görüntüleme", "Yeni Kayıt", "Düzenleme", "Silme"],
  },
  {
    id: "finance",
    name: "Finans ve Bakiye",
    actions: ["Görüntüleme", "Yeni Kayıt", "Düzenleme", "Silme"],
  },
  {
    id: "pricing",
    name: "Fiyat Listeleri",
    actions: ["Görüntüleme", "Düzenleme"],
  },
  {
    id: "reports",
    name: "Raporlar",
    actions: ["Görüntüleme", "Dışa Aktarma"],
  },
  {
    id: "users_roles",
    name: "Kullanıcılar ve Roller",
    actions: ["Görüntüleme", "Yeni Kayıt", "Düzenleme", "Silme"],
  },
];

export default function NewRolePage() {
  const router = useRouter();
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

  const handleTogglePermission = (moduleId: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId]?.[action],
      },
    }));
  };

  const handleToggleRow = (moduleId: string, actions: string[]) => {
    const isAllSelected = actions.every((a) => permissions[moduleId]?.[a]);
    const newState = !isAllSelected;
    
    setPermissions((prev) => {
      const next = { ...prev };
      if (!next[moduleId]) next[moduleId] = {};
      actions.forEach((a) => {
        next[moduleId][a] = newState;
      });
      return next;
    });
  };

  const handleSave = () => {
    if (!roleName) {
      toast.error("Lütfen rol adını giriniz.");
      return;
    }
    
    // Prototip uyarı
    toast.info("Gelişmiş Rol Sistemi Yakında Aktif", {
      description: "Bu form şu an arayüz (UI) demosu olarak aktiftir. Özel rol oluşturma altyapısı veritabanı göçü (migration) tamamlandığında devreye girecektir.",
      icon: <ShieldAlert className="h-4 w-4" />
    });
  };

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Yeni Rol Oluştur" description="Sisteme özel yetkilerle donatılmış yeni bir rol ekleyin." />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-xl border border-panel-secondary bg-white px-4 py-2.5 text-sm font-semibold text-muted transition hover:bg-panel-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-soft transition-transform hover:scale-105 hover:bg-primary-strong"
          >
            <Save className="h-4 w-4" />
            Rolü Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol Kolon - Temel Bilgiler */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white p-6 shadow-soft">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Rol Bilgileri</h2>
                <p className="text-xs text-muted">Rolün temel tanımlamalarını yapın.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Rol Adı</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Örn: Operasyon Sorumlusu"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Açıklama</label>
                <textarea
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Bu role sahip kullanıcıların genel sorumlulukları nelerdir?"
                  rows={4}
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Yetki Matrisi */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="rounded-[24px] border border-panel-secondary bg-white overflow-hidden shadow-soft flex flex-col">
            <div className="p-6 border-b border-panel-secondary bg-panel/30">
              <h2 className="text-lg font-bold text-foreground">Erişim ve Yetki Matrisi</h2>
              <p className="text-xs text-muted mt-1">
                Bu role sahip kullanıcıların sistemdeki hangi modüllere erişebileceğini ve hangi işlemleri yapabileceğini belirleyin.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-panel border-b border-panel-secondary text-left">
                    <th className="px-6 py-4 font-semibold text-foreground w-1/3">Modül Adı</th>
                    <th className="px-6 py-4 font-semibold text-foreground text-center">Tümünü Seç</th>
                    <th className="px-6 py-4 font-semibold text-foreground col-span-4">Özel Yetkiler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-panel-secondary">
                  {MODULES.map((module) => {
                    const isAllSelected = module.actions.every((a) => permissions[module.id]?.[a]);
                    
                    return (
                      <tr key={module.id} className="hover:bg-panel-secondary/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {module.name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleRow(module.id, module.actions)}
                            className={`flex h-6 w-6 mx-auto items-center justify-center rounded-md border transition-colors ${
                              isAllSelected
                                ? "bg-primary border-primary text-white"
                                : "border-slate-300 bg-white text-transparent hover:border-primary"
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-3">
                            {module.actions.map((action) => {
                              const isSelected = permissions[module.id]?.[action];
                              return (
                                <button
                                  key={action}
                                  onClick={() => handleTogglePermission(module.id, action)}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors border ${
                                    isSelected
                                      ? "bg-primary/10 border-primary/20 text-primary"
                                      : "bg-white border-panel-secondary text-muted hover:bg-panel-secondary hover:text-foreground"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3" />}
                                  {action}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
