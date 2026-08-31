import { Package } from "lucide-react";

import { cn } from "@/lib/cn";

export const CARGO_PROVIDERS = [
  { key: "aras", label: "Aras Kargo", short: "Aras" },
  { key: "dhl", label: "DHL", short: "DHL" },
  { key: "hepsijet", label: "HepsiJET", short: "HepsiJET" },
  { key: "ptt", label: "PTT Kargo", short: "PTT" },
] as const;

export type CargoProviderKey = (typeof CARGO_PROVIDERS)[number]["key"];

export function providerLabel(key: string): string {
  return CARGO_PROVIDERS.find((p) => p.key === key)?.label ?? key;
}

/** Kargo firması rozeti. */
export function CargoProviderBadge({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-panel-secondary bg-panel px-2 py-0.5 text-xs font-medium text-foreground",
        className
      )}
    >
      <Package className="h-3 w-3 text-primary" aria-hidden />
      {providerLabel(provider)}
    </span>
  );
}
