import { cn } from "@/lib/cn";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2";

const VARIANT_MAP: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-soft hover:bg-primary-strong hover:shadow-lift focus-visible:ring-primary/40",
  secondary:
    "bg-panel text-foreground border border-panel-secondary shadow-soft hover:border-panel-secondary hover:bg-panel-secondary hover:shadow-lift",
  ghost: "text-muted hover:bg-panel-secondary hover:text-foreground",
  danger: "bg-danger text-white shadow-soft hover:opacity-90 hover:shadow-lift focus-visible:ring-danger/40",
};

const SIZE_MAP: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(BASE, VARIANT_MAP[variant], SIZE_MAP[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
