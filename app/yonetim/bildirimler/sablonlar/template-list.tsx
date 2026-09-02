"use client";

import { useState } from "react";
import { updateTemplateAction } from "./actions";
import { toast } from "sonner";
import { Edit2, Save, CheckCircle2, XCircle } from "lucide-react";

export function TemplateList({ templates }: { templates: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {templates.map((tpl) => (
        <TemplateCard key={tpl.id} template={tpl} />
      ))}
    </div>
  );
}

function TemplateCard({ template }: { template: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(template.content);
  const [isActive, setIsActive] = useState(template.isActive);
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    try {
      await updateTemplateAction(template.id, content, isActive);
      toast.success("Şablon başarıyla güncellendi.");
      setIsEditing(false);
    } catch (e) {
      toast.error("Bir hata oluştu.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="card-surface rounded-2xl border border-panel-secondary p-5 shadow-sm transition-all hover:shadow-md flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground truncate">{template.name}</h3>
        {isActive ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 px-2 py-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Aktif
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted bg-panel-secondary px-2 py-1 rounded-full">
            <XCircle className="h-3 w-3" /> Pasif
          </span>
        )}
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-panel-secondary bg-panel-secondary/30 p-3 text-sm outline-none transition-colors focus:border-primary"
            />
            
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)} 
                className="rounded border-panel-secondary text-primary focus:ring-primary h-4 w-4"
              />
              <span className="font-medium text-foreground">Şablon Aktif</span>
            </label>
          </div>
        ) : (
          <div className="rounded-xl bg-panel-secondary/30 p-4 text-sm text-foreground break-words min-h-[100px]">
            {template.content}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold text-muted mb-2 uppercase tracking-wider">Kullanılabilir Değişkenler</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {template.variables?.map((v: string) => (
            <span key={v} className="rounded-md bg-panel-secondary px-1.5 py-0.5 text-xs text-muted font-mono select-all">
              {`{${v}}`}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-panel-secondary mt-auto">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => {
                setContent(template.content);
                setIsActive(template.isActive);
                setIsEditing(false);
              }}
              disabled={isPending}
              className="flex-1 rounded-xl border border-panel-secondary px-4 py-2 text-sm font-semibold text-muted hover:bg-panel-secondary transition"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              {isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <Save className="h-4 w-4" />}
              Kaydet
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-panel-secondary px-4 py-2 text-sm font-semibold text-foreground hover:bg-panel-secondary transition"
          >
            <Edit2 className="h-4 w-4" />
            Düzenle
          </button>
        )}
      </div>
    </div>
  );
}
