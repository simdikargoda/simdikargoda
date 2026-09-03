import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { AppError } from "@/lib/errors";
import { getServerConfig } from "@/lib/config";
import { getDb } from "@/db/client";
import { sessions, users, userRoleEnum, securityAuditLogs } from "@/db/schema/auth";
import { eq, and, not } from "drizzle-orm";

export const SESSION_COOKIE = "kargo_session";
export const PENDING_2FA_COOKIE = "kargo_2fa_pending";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;   // 7 gün (default)
const REMEMBER_ME_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 gün
const PENDING_2FA_DURATION_SECONDS = 60 * 15; // 15 dakika

export interface SessionPayload {
  userId: string;
  role: (typeof userRoleEnum.enumValues)[number];
  customerId: string | null;
  name: string;
  email: string;
}

/** Kullanıcı adına imzalanmış bir JWT token + DB session oluşturur. */
export async function createSession(userId: string, userAgent?: string, ipAddress?: string, rememberMe = false): Promise<string> {
  const cfg = getServerConfig();
  const secret = new TextEncoder().encode(cfg.authSecret);

  const user = await getDb().query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw new AppError("UNAUTHORIZED", "Kullanıcı bulunamadı.", 401);
  }

  const durationSeconds = rememberMe ? REMEMBER_ME_DURATION_SECONDS : SESSION_DURATION_SECONDS;

  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    customerId: user.customerId ?? null,
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${durationSeconds}s`)
    .sign(secret);

  // Token hash'ini DB'ye kaydet (raw token DB'de tutulmaz).
  const crypto = await import("crypto");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await getDb().insert(sessions).values({
    userId,
    tokenHash,
    userAgent: userAgent ?? null,
    ipAddress: ipAddress ?? null,
    expiresAt: new Date(Date.now() + durationSeconds * 1000),
  });

  return token;
}

export async function createPending2FAToken(userId: string, rememberMe: boolean): Promise<string> {
  const cfg = getServerConfig();
  const secret = new TextEncoder().encode(cfg.authSecret);
  
  const token = await new SignJWT({ userId, rememberMe })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_DURATION_SECONDS}s`)
    .sign(secret);
    
  return token;
}

export async function verifyPending2FAToken(token: string): Promise<{ userId: string; rememberMe: boolean }> {
  const cfg = getServerConfig();
  const secret = new TextEncoder().encode(cfg.authSecret);
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: String(payload.userId), rememberMe: Boolean(payload.rememberMe) };
  } catch {
    throw new AppError("UNAUTHORIZED", "Geçersiz veya süresi dolmuş işlem. Tekrar giriş yapın.", 401);
  }
}

/** İmzalı token'ı doğrular ve session payload döndürür. */
export async function verifyToken(token: string): Promise<SessionPayload> {
  const cfg = getServerConfig();
  const secret = new TextEncoder().encode(cfg.authSecret);

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.userId || !payload.role) {
      throw new AppError("UNAUTHORIZED", "Geçersiz oturum.", 401);
    }
    return {
      userId: String(payload.userId),
      role: payload.role as SessionPayload["role"],
      customerId: (payload.customerId as string) ?? null,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    throw new AppError("UNAUTHORIZED", "Oturum süresi dolmuş. Tekrar giriş yapın.", 401);
  }
}

/** Kayıtlı DB session'ının geçerli ve kullanıcının aktif olduğunu doğrular. */
async function persistSessionValid(tokenHash: string, userId: string): Promise<boolean> {
  const db = getDb();
  const row = await db.query.sessions.findFirst({ where: eq(sessions.tokenHash, tokenHash) });
  if (!row) return false;
  if (row.expiresAt.getTime() < Date.now()) return false;

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || user.status !== "active") return false;
  return true;
}

/** HttpOnly cookie'yi ayarlar. rememberMe=true → 30 gün persistent, false → session cookie. */
export async function setSessionCookie(token: string, rememberMe = false): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(rememberMe
      ? { maxAge: REMEMBER_ME_DURATION_SECONDS }
      : { maxAge: SESSION_DURATION_SECONDS }),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let payload: SessionPayload;
  try {
    payload = await verifyToken(token);
  } catch {
    // Token geçersiz veya süresi dolmuşsa oturum yok sayılır
    return null;
  }

  const crypto = await import("crypto");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const valid = await persistSessionValid(tokenHash, payload.userId);
  if (!valid) return null;

  return payload;
}

// ------------------------------------------------------------------
// Oturum ve Güvenlik API'leri
// ------------------------------------------------------------------

export async function getUserSessions(userId: string) {
  const db = getDb();
  return db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });
}

export async function revokeSession(sessionId: string, userId: string) {
  const db = getDb();
  await db.delete(sessions).where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)));
}

export async function revokeAllOtherSessions(userId: string, currentSessionId: string) {
  const db = getDb();
  await db.delete(sessions).where(and(eq(sessions.userId, userId), not(eq(sessions.id, currentSessionId))));
}

export async function logSecurityEvent(userId: string, action: string, ipAddress?: string, userAgent?: string) {
  const db = getDb();
  await db.insert(securityAuditLogs).values({
    userId,
    action,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  });
}
