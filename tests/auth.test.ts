import { describe, expect, it, vi, beforeEach, afterAll } from "vitest";

import { verifyTwoFactorCode, encryptSecret, decryptSecret } from "@/lib/2fa";

describe("2FA ve Kriptografi", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // 32-byte hex key = 64 characters
    process.env.MFA_ENCRYPTION_KEY = "a".repeat(64);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("MFA secret doğru şifrelenir ve çözülür (v1)", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const encrypted = encryptSecret(secret);
    
    expect(encrypted.startsWith("v1:")).toBe(true);
    
    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(secret);
  });

  it("Düz metin secret kabul edilmez", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    expect(() => decryptSecret(secret)).toThrow("MFA secret güvenli formatta");
  });

  it("v0 (eski) formattaki secret çözülebilir (backward compat)", () => {
    const secret = "OLDSECRET123";
    // Manuel olarak eski format oluştur (iv:authTag:encrypted)
    const crypto = require("crypto");
    const keyBuffer = Buffer.from(process.env.MFA_ENCRYPTION_KEY!, "hex");
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);
    let encryptedData = cipher.update(secret, "utf8", "base64");
    encryptedData += cipher.final("base64");
    const authTag = cipher.getAuthTag().toString("base64");
    
    const oldFormat = `${iv.toString("base64")}:${authTag}:${encryptedData}`;
    
    expect(oldFormat.startsWith("v1:")).toBe(false);
    expect(decryptSecret(oldFormat)).toBe(secret);
  });
});
