"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";

import { getDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { AppError } from "@/lib/errors";
import { 
  createSession, 
  setSessionCookie, 
  createPending2FAToken, 
  verifyPending2FAToken,
  PENDING_2FA_COOKIE 
} from "@/lib/auth";
import { verifyTwoFactorCode, decryptSecret } from "@/lib/2fa";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin."),
  password: z.string().min(1, "Şifre zorunludur."),
  rememberMe: z.coerce.boolean().optional(),
});

const twoFactorSchema = z.object({
  code: z.string().length(6, "Doğrulama kodu 6 haneli olmalıdır."),
});

export type LoginState = {
  error?: string;
  requiresTwoFactor?: boolean;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("remember_me") === "on",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Geçersiz giriş.";
    return { error: first };
  }

  const { email, password, rememberMe } = parsed.data;

  try {
    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user || user.status !== "active") {
      throw new AppError("UNAUTHORIZED", "E-posta veya şifre hatalı.", 401);
    }

    // Admin muafiyeti: Yöneticiler brute-force kilidine takılmaz.
    if (user.role !== "admin") {
      if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        throw new AppError("TOO_MANY_REQUESTS", "Çok fazla hatalı giriş yaptınız. Lütfen daha sonra tekrar deneyin.", 429);
      }
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      if (user.role !== "admin") {
        const newAttempts = user.failedLoginAttempts + 1;
        const updates: { failedLoginAttempts: number; lockedUntil?: Date | null } = { 
          failedLoginAttempts: newAttempts 
        };
        
        if (newAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika kilit
        }
        
        await db.update(users).set(updates).where(eq(users.id, user.id));
      }
      throw new AppError("UNAUTHORIZED", "E-posta veya şifre hatalı.", 401);
    }

    // Başarılı giriş: hata sayacını ve kilidi sıfırla
    if (user.role !== "admin" && (user.failedLoginAttempts > 0 || user.lockedUntil)) {
      await db.update(users).set({ failedLoginAttempts: 0, lockedUntil: null }).where(eq(users.id, user.id));
    }

    // 2FA açıksa session başlatmadan geçici token ver
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      const pendingToken = await createPending2FAToken(user.id, rememberMe ?? false);
      const cookieStore = await cookies();
      cookieStore.set(PENDING_2FA_COOKIE, pendingToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 15 * 60, // 15 dakika
      });
      return { requiresTwoFactor: true };
    }

    // 2FA kapalıysa direkt giriş
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? undefined;
    const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    const token = await createSession(user.id, userAgent, ipAddress);
    await setSessionCookie(token, rememberMe ?? false);
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "Giriş yapılırken bir hata oluştu." };
  }

  redirect("/");
}

export async function verifyTwoFactorAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = twoFactorSchema.safeParse({
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz kod.", requiresTwoFactor: true };
  }

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_2FA_COOKIE)?.value;

  if (!pendingToken) {
    return { error: "Giriş süresi dolmuş. Lütfen tekrar giriş yapın." };
  }

  try {
    const { userId, rememberMe } = await verifyPending2FAToken(pendingToken);
    
    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

    if (!user || user.status !== "active" || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError("UNAUTHORIZED", "Geçersiz hesap durumu.", 401);
    }

    const isValid = verifyTwoFactorCode(parsed.data.code, decryptSecret(user.twoFactorSecret));
    if (!isValid) {
      return { error: "Hatalı doğrulama kodu.", requiresTwoFactor: true };
    }

    // Kod doğru, session oluştur
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? undefined;
    const ipAddress = headersList.get("x-forwarded-for") ?? "127.0.0.1";

    const token = await createSession(user.id, userAgent, ipAddress);
    await setSessionCookie(token, rememberMe);
    cookieStore.delete(PENDING_2FA_COOKIE);
  } catch (err) {
    if (err instanceof AppError) {
      return { error: err.message };
    }
    return { error: "Doğrulama sırasında bir hata oluştu." };
  }

  redirect("/");
}
