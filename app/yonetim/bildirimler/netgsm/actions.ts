"use server";

import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/guard";

export type NetgsmConfigState = {
  error?: string;
  success?: boolean;
};

export async function saveNetgsmConfig(
  _prev: NetgsmConfigState,
  formData: FormData
): Promise<NetgsmConfigState> {
  await requireAdmin();

  const usercode = formData.get("usercode")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const header = formData.get("header")?.toString() || "";

  if (!usercode || !password || !header) {
    return { error: "Lütfen tüm alanları doldurun." };
  }

  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    let envContent = "";
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const updates: Record<string, string> = {
      NETGSM_USERCODE: usercode,
      NETGSM_PASSWORD: password,
      NETGSM_HEADER: header,
    };

    let newEnvContent = envContent;
    for (const [key, val] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(newEnvContent)) {
        newEnvContent = newEnvContent.replace(regex, `${key}=${val}`);
      } else {
        newEnvContent += `\n${key}=${val}`;
      }
      process.env[key] = val; // Apply dynamically
    }

    fs.writeFileSync(envPath, newEnvContent.trim() + "\n", "utf-8");

    return { success: true };
  } catch (err: any) {
    return { error: "Ayarlar kaydedilirken bir hata oluştu: " + err.message };
  }
}

export async function testNetgsmConfig(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  await requireAdmin();
  
  const usercode = formData.get("usercode")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const header = formData.get("header")?.toString() || "";

  if (!usercode || !password || !header) {
    return { error: "Lütfen önce test edilecek değerleri girin." };
  }

  try {
    const url = new URL("https://api.netgsm.com.tr/sms/send/get");
    url.searchParams.set("usercode", usercode);
    url.searchParams.set("password", password);
    url.searchParams.set("gsmno", "905555555555");
    url.searchParams.set("text", "Netgsm baglanti testi");
    url.searchParams.set("msgheader", header);

    const res = await fetch(url.toString(), { method: "GET" });
    const body = await res.text();

    if (body.startsWith("30")) return { error: "Geçersiz kullanıcı adı veya şifre (Hata 30)." };
    if (body.startsWith("40")) return { error: "Geçersiz gönderici başlığı (Hata 40)." };
    
    return { success: true }; 
  } catch (err: any) {
    return { error: "Bağlantı hatası: " + err.message };
  }
}
