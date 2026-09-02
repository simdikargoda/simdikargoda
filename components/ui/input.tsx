"use client";

import { cn } from "@/lib/cn";
import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

/** Etiketli + hata durumlu giriş alanı. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, help, id, type, ...props }, ref) => {
    const inputId = id ?? props.name;
    const [showPassword, setShowPassword] = useState(false);
    
    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={currentType}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : help ? `${inputId}-help` : undefined}
            className={cn(
              "w-full rounded-xl border bg-panel px-3 py-2 text-sm text-foreground shadow-soft transition-all duration-150 placeholder:text-muted hover:border-primary/40 focus:shadow-lift focus:outline-none focus:ring-2",
              error
                ? "border-danger focus:border-danger focus:ring-danger/30"
                : "border-panel-secondary focus:border-primary focus:ring-primary/30",
              isPassword && "pr-10",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors outline-none focus:text-primary"
              title={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : help ? (
          <p id={`${inputId}-help`} className="mt-1 text-xs text-muted">
            {help}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, help, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full rounded-xl border bg-panel px-3 py-2 text-sm text-foreground shadow-soft transition-all duration-150 placeholder:text-muted hover:border-primary/40 focus:shadow-lift focus:outline-none focus:ring-2",
            error
              ? "border-danger focus:border-danger focus:ring-danger/30"
              : "border-panel-secondary focus:border-primary focus:ring-primary/30",
            className
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : help ? (
          <p id={`${inputId}-help`} className="mt-1 text-xs text-muted">
            {help}
          </p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
