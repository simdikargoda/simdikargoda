import { cn } from "@/lib/cn";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

/** Etiketli + hata durumlu giriş alanı. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, help, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : help ? `${inputId}-help` : undefined}
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
