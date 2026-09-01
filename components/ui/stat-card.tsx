import {
  ArrowDownRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: "up" | "down";
  hint?: string;
  /** İkon kutusunun arka plan rengi (Tailwind class). Varsayılan soft primary. */
  iconClassName?: string;
  className?: string;
  /** Karttaki değer boyutu (responsive tabanlı). */
  valueClassName?: string;
};

/** Dashboard KPI kartı — premium soft lift + glassmorphism. */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  iconClassName,
  valueClassName,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "card-surface group relative overflow-hidden rounded-2xl p-5",
        className
      )}
    >
      {/* Sol taraf indis çizgisi */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 bg-primary/20 transition-colors group-hover:bg-primary/50"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-[26px] font-semibold leading-none tracking-tight text-foreground",
              valueClassName
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs font-medium text-muted/80">{hint}</p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          {Icon ? (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105",
                iconClassName
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                trend === "up"
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend === "up" ? "Yukarı" : "Aşağı"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
