"use client";

import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  help?: string;
}

/** Etiketli + hata durumlu seçim alanı. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, help, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            className={cn(
              "w-full appearance-none rounded-xl border bg-panel px-3 py-2 pr-9 text-sm text-foreground shadow-soft transition-all duration-150 hover:border-primary/40 focus:shadow-lift focus:outline-none focus:ring-2",
              error
                ? "border-danger focus:border-danger focus:ring-danger/30"
                : "border-panel-secondary focus:border-primary focus:ring-primary/30",
              !props.value && "text-muted",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
        {error ? (
          <p id={`${selectId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : help ? (
          <p id={`${selectId}-help`} className="mt-1 text-xs text-muted">
            {help}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
