"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { requireAdmin } from "@/lib/guard";

const execAsync = promisify(exec);

export type GitActionState = {
  success?: boolean;
  error?: string;
  message?: string;
  log?: string;
};

export async function gitPushAction(
  _prev: GitActionState,
  _formData: FormData
): Promise<GitActionState> {
  await requireAdmin();
  try {
    const { stdout, stderr } = await execAsync(
      'git add . && git commit -m "Auto backup from SaaS panel" && git push origin main'
    );
    return {
      success: true,
      message: "Proje başarıyla GitHub'a yedeklendi!",
      log: stdout + stderr,
    };
  } catch (error: any) {
    if (error.stdout?.includes("nothing to commit") || error.stderr?.includes("nothing to commit")) {
      try {
        const { stdout, stderr } = await execAsync("git push origin main");
        return {
          success: true,
          message: "Değişiklik yoktu, mevcut yedekler doğrulandı.",
          log: stdout + stderr,
        };
      } catch (err: any) {
        return { error: "Gönderme hatası: " + err.message };
      }
    }
    return { error: "Yedekleme hatası: " + error.message };
  }
}

export async function gitPullAction(
  _prev: GitActionState,
  _formData: FormData
): Promise<GitActionState> {
  await requireAdmin();
  try {
    const { stdout, stderr } = await execAsync("git pull origin main");
    const isUpToDate = stdout.includes("Already up to date");
    
    return {
      success: true,
      message: isUpToDate 
        ? "Sistem zaten güncel, yeni bir güncelleme bulunmamaktadır." 
        : "Uzak sunucudaki güncellemeler başarıyla çekildi!",
      log: stdout + stderr,
    };
  } catch (error: any) {
    return { error: "Güncelleme hatası: " + error.message };
  }
}
