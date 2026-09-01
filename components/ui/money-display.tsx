import { formatKurus } from "@/lib/money";

/** Para gösterim bileşeni — kuruş → Türkçe ₺ formatı. */
export function MoneyDisplay({
  kurus,
  className,
}: {
  kurus: number;
  className?: string;
}) {
  return <span className={className}>{formatKurus(kurus)}</span>;
}
