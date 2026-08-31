import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { shipments, shipmentStatusHistory } from "@/db/schema/shipment";
import { customers } from "@/db/schema/customer";

export async function getShipmentById(id: string) {
  const db = getDb();
  const shipment = await db
    .select({
      id: shipments.id,
      trackingNumber: shipments.trackingNumber,
      barcode: shipments.barcode,
      status: shipments.status,
      provider: shipments.provider,
      senderName: shipments.senderName,
      senderPhone: shipments.senderPhone,
      senderAddress: shipments.senderAddress,
      receiverName: shipments.receiverName,
      receiverPhone: shipments.receiverPhone,
      receiverAddress: shipments.receiverAddress,
      packageCount: shipments.packageCount,
      desi: shipments.desi,
      weight: shipments.weight,
      salePriceKurus: shipments.salePriceKurus,
      createdAt: shipments.createdAt,
      customerName: customers.name,
      customerId: customers.id,
    })
    .from(shipments)
    .innerJoin(customers, eq(customers.id, shipments.customerId))
    .where(eq(shipments.id, id))
    .limit(1)
    .then((res) => res[0] ?? null);

  return shipment;
}

export async function getShipmentStatusHistory(shipmentId: string) {
  const db = getDb();
  return db
    .select()
    .from(shipmentStatusHistory)
    .where(eq(shipmentStatusHistory.shipmentId, shipmentId))
    .orderBy(shipmentStatusHistory.createdAt);
}
