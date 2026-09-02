import { StatusBadge, type StatusBadgeColor } from "@/components/ui/status-badge";

import { shipmentStatusEnum } from "@/db/schema/shipment";

type ShipmentStatus = (typeof shipmentStatusEnum.enumValues)[number];

const STATUS_META: Record<string, { label: string; color: StatusBadgeColor }> = {
  created: { label: "Oluşturuldu", color: "slate" },
  in_transit: { label: "Yolda", color: "blue" },
  delivered: { label: "Teslim Edildi", color: "green" },
  pending: { label: "Bekliyor", color: "amber" },
  issue: { label: "Sorunlu", color: "rose" },
  returned: { label: "İade", color: "orange" },
  cancelled: { label: "İptal", color: "slate" },
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus | string }) {
  const normalized = typeof status === "string" ? status.toLowerCase().trim() : String(status);
  
  // Eğer doğrudan "Pending" gibi bir şey gelirse ve STATUS_META'da yoksa
  if (normalized === "pending") {
    return <StatusBadge label="Bekliyor" color="amber" />;
  }

  const meta = STATUS_META[normalized] || { label: status || "Bilinmiyor", color: "slate" };
  return <StatusBadge label={meta.label} color={meta.color} />;
}
