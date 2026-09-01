"use server";

import fs from "fs";
import path from "path";
import { requireStaff } from "@/lib/guard";

export type NetgsmConfigState = {
  error?: string;
  success?: boolean;
};

export async function saveNetgsmConfig(
  _prev: NetgsmConfigState,
  formData: FormData
): Promise<NetgsmConfigState> {
  await requireStaff();

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
