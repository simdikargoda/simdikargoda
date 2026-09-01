import "server-only";

/**
 * Ortam değişkenleri okuma yardımcıları.
 * Core required değişkenler config açılışında doğrulanır;
 * opsiyonel entegrasyon değişkenleri eksikse ilgili özellik disabled kalır.
 */

const PRODUCTION = process.env.NODE_ENV === "production";

interface ServerConfig {
  appUrl: string;
  authSecret: string;
  databaseUrl: string;
}

/** Production'da zorunlu core değişkenleri erken ve anlaşılır biçimde doğrular. */
export function getServerConfig(): ServerConfig {
  const authSecret = process.env.AUTH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;

  if (PRODUCTION) {
    if (!authSecret || !databaseUrl) {
      throw new Error(
        "Core environment değişkenleri eksik. AUTH_SECRET ve DATABASE_URL production için zorunludur."
      );
    }
  }

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    authSecret: authSecret || "dev-insecure-secret-change-me",
    databaseUrl: databaseUrl || "postgresql://postgres:postgres@localhost:5432/kargo",
  };
}

/**
 * Opsiyonel bir entegrasyon için credential set'inin tanımlı olup
 * olmadığını kontrol eder. Değerler boş ya da placeholder ise configured=false.
 */
export function isIntegrationConfigured(values: Record<string, string | undefined>): boolean {
  return Object.values(values).every(
    (v) => typeof v === "string" && v.trim().length > 0 && !v.includes("YOUR_")
  );
}
