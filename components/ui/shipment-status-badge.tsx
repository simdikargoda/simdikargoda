import { StatusBadge, type StatusBadgeColor } from "@/components/ui/status-badge";

import { shipmentStatusEnum } from "@/db/schema/shipment";

type ShipmentStatus = (typeof shipmentStatusEnum.enumValues)[number];

const STATUS_META: Record<ShipmentStatus, { label: string; color: StatusBadgeColor }> = {
  created: { label: "Oluşturuldu", color: "slate" },
  in_transit: { label: "Yolda", color: "blue" },
  delivered: { label: "Teslim Edildi", color: "green" },
  pending: { label: "Bekleyen", color: "amber" },
  issue: { label: "Sorunlu", color: "rose" },
  returned: { label: "İade", color: "orange" },
  cancelled: { label: "İptal", color: "slate" },
};

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus | string }) {
  const meta = STATUS_META[status as ShipmentStatus] || { label: status || "Bilinmiyor", color: "slate" };
  return <StatusBadge label={meta.label} color={meta.color} />;
}
