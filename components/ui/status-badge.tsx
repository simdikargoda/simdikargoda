import { cn } from "@/lib/cn";

export type StatusBadgeColor =
  | "slate"
  | "blue"
  | "green"
  | "amber"
  | "rose"
  | "orange";

export type StatusBadgeProps = {
  label: string;
  color: StatusBadgeColor;
};

const COLOR_MAP: Record<StatusBadgeColor, string> = {
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
};

/** Durum etiketi — durumu yalnızca renk değil metin + ikon ile de gösterir. */
export function StatusBadge({ label, color }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        COLOR_MAP[color]
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
