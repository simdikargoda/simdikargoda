"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";

import { loginAction, verifyTwoFactorAction, type LoginState } from "./actions";

export function LoginForm() {
  const [loginState, loginFormAction, isLoginPending] = useActionState<LoginState, FormData>(
    loginAction,
    {}
  );
  
  const [mfaState, mfaFormAction, isMfaPending] = useActionState<LoginState, FormData>(
    verifyTwoFactorAction,
    {}
  );

  const [showPassword, setShowPassword] = useState(false);

  const inputBase =
    "w-full rounded-xl border bg-panel px-3 py-2.5 text-sm text-foreground shadow-soft transition-all duration-150 placeholder:text-muted hover:border-primary/40 focus:shadow-lift focus:outline-none focus:ring-2";

  // 2FA ekranı (requiresTwoFactor varsa MFA formu render edilir)
  if (loginState.requiresTwoFactor || mfaState.requiresTwoFactor) {
    return (
      <form action={mfaFormAction} className="space-y-5 fade-in-up" noValidate>
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">İki Aşamalı Doğrulama</h3>
          <p className="mt-1 text-sm text-muted">Lütfen doğrulayıcı uygulamanızdaki 6 haneli kodu girin.</p>
        </div>

        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-foreground text-center">
            Doğrulama Kodu
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="one-time-code"
            required
            className={`${inputBase} border-panel-secondary text-center text-2xl tracking-widest focus:border-primary focus:ring-primary/30`}
            placeholder="000000"
          />
        </div>

        {(mfaState.error || loginState.error) ? (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-center text-danger">
            {mfaState.error || loginState.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isMfaPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-primary-strong hover:shadow-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMfaPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {isMfaPending ? "Doğrulanıyor..." : "Doğrula ve Giriş Yap"}
        </button>
      </form>
    );
  }

  // Normal Login ekranı
  return (
    <form action={loginFormAction} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          E-posta veya Kullanıcı Adı
        </label>
        <input
          id="email"
          name="email"
          type="text"
          autoComplete="username"
          required
          className={`${inputBase} border-panel-secondary focus:border-primary focus:ring-primary/30`}
          placeholder="ornek@firma.com veya kullaniciadi"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Şifre
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputBase} border-panel-secondary pr-10 focus:border-primary focus:ring-primary/30`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Beni hatırla + Şifremi unuttum */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            className="h-4 w-4 rounded border-panel-secondary accent-primary"
          />
          <span className="text-sm text-muted">Beni hatırla</span>
        </label>
      </div>

      {loginState.error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
        >
          {loginState.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoginPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-all duration-150 hover:bg-primary-strong hover:shadow-lift active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoginPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {isLoginPending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>

      <div className="relative mt-8 mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-panel-secondary/80" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted">veya</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-panel-secondary bg-white px-4 py-2.5 text-sm font-semibold text-muted shadow-sm transition-all duration-150 cursor-not-allowed"
      >
        <ShieldCheck className="h-4 w-4" />
        SSO ile giriş yap (Çok Yakında)
      </button>
    </form>
  );
}
