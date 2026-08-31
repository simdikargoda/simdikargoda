import "server-only";
import crypto from "crypto";

import { authenticator } from "otplib";
import QRCode from "qrcode";
import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

/** Yeni bir 2FA gizli anahtarı üretir. */
export function generateTwoFactorSecret() {
  return authenticator.generateSecret();
}

/** 2FA kurulumu için QR Kod URL'sini üretir. */
export async function generateQrCodeUrl(email: string, secret: string) {
  const otpauth = authenticator.keyuri(email, "KargoOps", secret);
  return await QRCode.toDataURL(otpauth);
}

/** Kullanıcının girdiği 6 haneli kodu doğrular. */
export function verifyTwoFactorCode(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

/** MFA Secret'ı AES-256-GCM ile şifreler */
export function encryptSecret(secret: string): string {
  const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length !== 64) {
    throw new Error("Geçerli bir MFA_ENCRYPTION_KEY (32 byte hex) yapılandırılmamış!");
  }
  
  const keyBuffer = Buffer.from(encryptionKey, "hex");
  const iv = crypto.randomBytes(12); // GCM için standart nonce boyutu
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
  
  let encrypted = cipher.update(secret, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

/** Şifrelenmiş MFA Secret'ı çözer */
export function decryptSecret(encryptedSecret: string): string {
  if (!encryptedSecret) return "";
  const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length !== 64) {
    throw new Error("Geçerli bir MFA_ENCRYPTION_KEY (32 byte hex) yapılandırılmamış!");
  }

  const parts = encryptedSecret.split(":");
  if (parts.length !== 3) {
    // Eski/şifrelenmemiş (plaintext) veri var demektir, backward compatibility (ya da doğrudan migration gerekir)
    // Güvenlik gereği düz plaintext dönmesi istenmiyorsa hata verilebilir.
    // Ancak master prompt "plaintext saklanmamalı" diyor.
    return encryptedSecret; 
  }

  const [ivBase64, authTagBase64, encryptedData] = parts;
  const keyBuffer = Buffer.from(encryptionKey, "hex");
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
