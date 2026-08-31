"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKurus } from "@/lib/money";
import { Plus, Edit2, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export default function PricingClient({
  initialPrices,
  initialHistory,
}: {
  initialPrices: any[];
  initialHistory: any[];
}) {
  const [prices, setPrices] = useState(initialPrices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    customerName: "",
    provider: "aras",
    type: "fixed",
    priceKurus: 0,
    costKurus: 0,
    isActive: true
  });

  const handleDelete = (id: string) => {
    if (!confirm("Bu fiyatı silmek istediğinize emin misiniz?")) return;
    
    // Optimistic delete
    setPrices(prices.filter(p => p.id !== id));
    toast.success("Fiyat kaydı başarıyla silindi.");
  };

  const handleEdit = (price: any) => {
    setEditingPrice(price);
    setFormData({
      customerName: price.customerName || "",
      provider: price.provider || "aras",
      type: price.type || "fixed",
      priceKurus: price.priceKurus / 100 || 0,
      costKurus: price.costKurus / 100 || 0,
      isActive: price.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPrice(null);
    setFormData({
      customerName: "",
      provider: "aras",
      type: "fixed",
      priceKurus: 0,
      costKurus: 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    const newPrice = {
      id: editingPrice ? editingPrice.id : Math.random().toString(36).substr(2, 9),
      customerName: formData.customerName || "Bilinmeyen Müşteri",
      provider: formData.provider,
      type: formData.type,
      priceKurus: Math.round(formData.priceKurus * 100),
      costKurus: Math.round(formData.costKurus * 100),
      isActive: formData.isActive
    };

    if (editingPrice) {
      setPrices(prices.map(p => p.id === editingPrice.id ? newPrice : p));
      toast.success("Fiyat başarıyla güncellendi.");
    } else {
      setPrices([newPrice, ...prices]);
      toast.success("Yeni fiyat listesi başarıyla eklendi.");
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Yeni Fiyat Ekle
        </button>
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary bg-white">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Fiyatlar
        </div>
        {prices.length === 0 ? (
          <EmptyState
            title="Fiyat tanımlanmamış"
            description="Kargo oluşturulmadan önce müşteri + kargo firması için fiyat tanımlanmalı."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary bg-panel-secondary/20 text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">Firma</th>
                  <th className="px-4 py-3 font-medium">Tip</th>
                  <th className="px-4 py-3 font-medium text-right">Satış</th>
                  <th className="px-4 py-3 font-medium text-right">Maliyet</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                  <th className="px-4 py-3 font-medium text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {prices.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {p.customerName ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{p.provider}</td>
                    <td className="px-4 py-3 capitalize text-muted">{p.type}</td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatKurus(p.priceKurus)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {formatKurus(p.costKurus)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.isActive
                            ? "inline-flex rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success"
                            : "inline-flex rounded-full bg-panel-secondary px-2.5 py-1 text-xs font-semibold text-muted"
                        }
                      >
                        {p.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(p)}
                          className="p-1.5 text-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-surface overflow-hidden rounded-2xl border border-panel-secondary bg-white">
        <div className="border-b border-panel-secondary px-5 py-4 text-sm font-semibold text-foreground">
          Fiyat Değişim Geçmişi
        </div>
        {initialHistory.length === 0 ? (
          <EmptyState title="Değişim yok" description="Henüz fiyat değişikliği yapılmamış." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-panel-secondary bg-panel-secondary/20 text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">Firma</th>
                  <th className="px-4 py-3 font-medium text-right">Eski</th>
                  <th className="px-4 py-3 font-medium text-right">Yeni</th>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-panel-secondary">
                {initialHistory.map((h) => (
                  <tr key={h.id} className="transition-colors hover:bg-panel-secondary/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {h.customerName ?? "—"}
                    </td>
                    <td className="px-4 py-3 capitalize text-muted">{h.provider}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted">
                      {h.oldValueKurus != null ? formatKurus(h.oldValueKurus) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {h.newValueKurus != null ? formatKurus(h.newValueKurus) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(h.changedAt).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-panel-secondary flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingPrice ? "Fiyat Listesini Düzenle" : "Yeni Fiyat Listesi Ekle"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Müşteri Adı</label>
                <input 
                  type="text" 
                  value={formData.customerName}
                  onChange={e => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Müşteri adını girin (Örn: ABC A.Ş.)"
                  className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Kargo Firması</label>
                  <select 
                    value={formData.provider}
                    onChange={e => setFormData({...formData, provider: e.target.value})}
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  >
                    <option value="aras">Aras Kargo</option>
                    <option value="dhl">DHL</option>
                    <option value="hepsijet">HepsiJET</option>
                    <option value="ptt">PTT Kargo</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Fiyat Tipi</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  >
                    <option value="fixed">Sabit Fiyat</option>
                    <option value="per_weight">Ağırlık Başına</option>
                    <option value="per_desi">Desi Başına</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Satış Fiyatı (TL)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.priceKurus}
                    onChange={e => setFormData({...formData, priceKurus: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">Maliyet (TL)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.costKurus}
                    onChange={e => setFormData({...formData, costKurus: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-panel-secondary bg-panel px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-panel-secondary mt-2">
                <div>
                  <h5 className="font-semibold text-sm text-foreground">Aktif / Pasif</h5>
                  <p className="text-xs text-muted mt-0.5">Bu fiyat tarifesini hemen kullanıma açın.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-panel-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-panel-secondary bg-panel/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-panel-secondary transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleSaveModal}
                className="px-6 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-md"
              >
                {editingPrice ? "Değişiklikleri Kaydet" : "Fiyatı Ekle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
