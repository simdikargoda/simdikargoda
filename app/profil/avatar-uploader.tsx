"use client";

import { useState, useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { updateAvatar } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AvatarUploader({ currentAvatarUrl, userId }: { currentAvatarUrl: string; userId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen geçerli bir resim dosyası seçin.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Dosya boyutu 2MB'dan küçük olmalıdır.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars") // Assumes "avatars" bucket exists
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 3. Update DB
      await updateAvatar(publicUrlData.publicUrl);
      
      toast.success("Profil resmi başarıyla güncellendi.");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("Yükleme başarısız: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      await updateAvatar(null);
      toast.success("Profil resmi kaldırıldı.");
      router.refresh();
    } catch (err: any) {
      toast.error("Kaldırma başarısız.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleUpload}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        Fotoğrafı Değiştir
      </button>
      {currentAvatarUrl && currentAvatarUrl !== "https://api.dicebear.com/9.x/notionists/svg?seed=Admin" && (
        <button 
          onClick={handleRemove}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/5 hover:text-danger/80 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Kaldır
        </button>
      )}
    </div>
  );
}
