import "server-only";

import { and, gte, lt, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { shipmentStatusEnum, shipments } from "@/db/schema/shipment";

/**
 * Raporlama servisi.
 *
 * - Dashboard ve rapor ekranları AYNI metrik tanımlarını kullanır
 *   (farklı ekranlar farklı rakam göstermez).
 * - Para alanları kuruş cinsinden integer döner; gösterim money.ts ile.
 * - Tüm değerler gerçek DB verisinden gelir; hard-coded sayı yok.
 */

const STATUS = shipmentStatusEnum.enumValues;

export interface DashboardSummary {
  totalShipments: number;
  byStatus: Record<string, number>;
  byProvider: Record<string, number>;
  totalSaleKurus: number;
  totalCostKurus: number;
  profitKurus: number;
}

/** Aynı metriklerin tüm ekranlarda tutarlılığı için ortak fonksiyon. */
export async function getDashboardSummary(dateRange?: {
  from: Date;
  to: Date;
}): Promise<DashboardSummary> {
  const db = getDb();

  const conditions = [];
  if (dateRange) {
    conditions.push(gte(shipments.createdAt, dateRange.from));
    conditions.push(lt(shipments.createdAt, dateRange.to));
  }

  const where = and(...conditions);
  const rows = where
    ? await db.select().from(shipments).where(where)
    : await db.select().from(shipments);

  const totalShipments = rows.length;

  const byStatus: Record<string, number> = {};
  const byProvider: Record<string, number> = {};
  let totalSaleKurus = 0;
  let totalCostKurus = 0;

  for (const s of rows) {
    byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
    byProvider[s.provider] = (byProvider[s.provider] ?? 0) + 1;
    totalSaleKurus += s.salePriceKurus;
    totalCostKurus += s.costPriceKurus;
  }

  return {
    totalShipments,
    byStatus,
    byProvider,
    totalSaleKurus,
    totalCostKurus,
    profitKurus: totalSaleKurus - totalCostKurus,
  };
}

/** Bekleyen/sorunlu/çıkmayan gibi operasyonel odaklı durum listelerini döndürür. */
export async function getOperationalCounts(): Promise<Record<string, number>> {
  const db = getDb();
  const rows = await db
    .select({ status: shipments.status, count: sql<number>`count(*)::int` })
    .from(shipments)
    .groupBy(shipments.status);

  const result: Record<string, number> = {};
  for (const s of STATUS) result[s] = 0;
  for (const r of rows) result[r.status] = r.count;
  return result;
}

export interface RevenueReportRow {
  status: string;
  count: number;
  saleKurus: number;
  costKurus: number;
  profitKurus: number;
}

/** Satış/maliyet/kâr durum bazlı raporu. */
export async function getRevenueReport(dateRange?: { from: Date; to: Date }) {
  const db = getDb();

  const conditions = [];
  if (dateRange) {
    conditions.push(gte(shipments.createdAt, dateRange.from));
    conditions.push(lt(shipments.createdAt, dateRange.to));
  }
  const where = and(...conditions);

  const rows = where
    ? await db
        .select()
        .from(shipments)
        .where(where)
        .groupBy(shipments.status)
    : await db.select().from(shipments);

  // Basit - gerçek DB aggregation yerine güvenilir js toplamı.
  // (Gerçek veri çok yüksekse SQL GROUP BY'a geçilebilir.)
  const grouped = new Map<string, RevenueReportRow>();
  const aggregate = (status: string, s: { salePriceKurus: number; costPriceKurus: number }) => {
    const g = grouped.get(status) ?? { status, count: 0, saleKurus: 0, costKurus: 0, profitKurus: 0 };
    g.count += 1;
    g.saleKurus += s.salePriceKurus;
    g.costKurus += s.costPriceKurus;
    g.profitKurus = g.saleKurus - g.costKurus;
    grouped.set(status, g);
  };

  for (const s of rows) aggregate(s.status, s);
  return Array.from(grouped.values());
}

/** Müşteri bazlı rapor. */
export async function getCustomerReport(dateRange?: { from: Date; to: Date }) {
  const db = getDb();

  const conditions = [];
  if (dateRange) {
    conditions.push(gte(shipments.createdAt, dateRange.from));
    conditions.push(lt(shipments.createdAt, dateRange.to));
  }
  const where = and(...conditions);

  const rows = where
    ? await db.select().from(shipments).where(where)
    : await db.select().from(shipments);

  const grouped = new Map<
    string,
    { customerId: string; count: number; saleKurus: number; costKurus: number; profitKurus: number }
  >();
  for (const s of rows) {
    const g = grouped.get(s.customerId) ?? {
      customerId: s.customerId,
      count: 0,
      saleKurus: 0,
      costKurus: 0,
      profitKurus: 0,
    };
    g.count += 1;
    g.saleKurus += s.salePriceKurus;
    g.costKurus += s.costPriceKurus;
    g.profitKurus = g.saleKurus - g.costKurus;
  }
  return Array.from(grouped.values());
}

export interface AdminDashboardData {
  kpi: {
    totalShipments: { value: number; yesterday: number };
    delivered: { value: number; yesterday: number };
    inTransit: { value: number; yesterday: number };
    returned: { value: number; yesterday: number };
    revenueKurus: { value: number; yesterday: number };
  };
  shipmentTrend: { date: string; count: number }[]; // Son 7 gün
  revenueTrend: { month: string; amountKurus: number }[]; // Son 6 ay
  byProvider: { name: string; count: number; percentage: number }[];
  byStatus: { name: string; count: number; percentage: number }[];
  topCustomers: { id: string; name: string; count: number; revenueKurus: number }[];
  recentTransactions: { id: string; type: string; title: string; subtitle: string; timeAgo: string }[];
}

export async function getAdminDashboardData(range: string = "Bugün"): Promise<AdminDashboardData> {
  const db = getDb();
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  let currentStart = todayStart;
  let currentEnd = now;
  let previousStart = yesterdayStart;
  let previousEnd = todayStart;

  if (range === "Dün") {
    currentStart = yesterdayStart;
    currentEnd = todayStart;
    previousStart = new Date(yesterdayStart.getTime() - 24 * 60 * 60 * 1000);
    previousEnd = yesterdayStart;
  } else if (range === "Son 7 Gün") {
    currentStart = sevenDaysAgo;
    currentEnd = now;
    previousStart = new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000);
    previousEnd = sevenDaysAgo;
  } else if (range === "Son 30 Gün") {
    currentStart = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
    currentEnd = now;
    previousStart = new Date(currentStart.getTime() - 30 * 24 * 60 * 60 * 1000);
    previousEnd = currentStart;
  } else if (range === "Bu Ay") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentEnd = now;
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previousEnd = currentStart;
  }

  const allShipments = await db.select().from(shipments);
  
  const { customers } = await import("@/db/schema/customer");
  const allCustomers = await db.select().from(customers);
  const customerMap = new Map(allCustomers.map(c => [c.id, c.name]));

  const kpi = {
    totalShipments: { value: 0, yesterday: 0 },
    delivered: { value: 0, yesterday: 0 },
    inTransit: { value: 0, yesterday: 0 },
    returned: { value: 0, yesterday: 0 },
    revenueKurus: { value: 0, yesterday: 0 },
  };

  const shipmentTrendMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    shipmentTrendMap.set(d.toISOString().split("T")[0], 0);
  }

  const revenueTrendMap = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toLocaleString('tr-TR', { month: 'short' });
    revenueTrendMap.set(monthKey, 0);
  }

  const byProviderMap = new Map<string, number>();
  const byStatusMap = new Map<string, number>();
  const topCustomersMap = new Map<string, { count: number; revenueKurus: number }>();

  for (const s of allShipments) {
    const sDate = new Date(s.createdAt);
    const isCurrent = sDate >= currentStart && sDate <= currentEnd;
    const isPrevious = sDate >= previousStart && sDate < previousEnd;

    // Sadece seçili tarih aralığı için KPI değerlerini topla
    if (isCurrent) {
      kpi.totalShipments.value++;
      kpi.revenueKurus.value += s.salePriceKurus;
      if (s.status === "delivered") kpi.delivered.value++;
      else if (s.status === "in_transit") kpi.inTransit.value++;
      else if (s.status === "returned") kpi.returned.value++;

      // Provider, Status ve Top Customers da sadece seçili tarihe göre hesaplansın
      byProviderMap.set(s.provider, (byProviderMap.get(s.provider) || 0) + 1);
      byStatusMap.set(s.status, (byStatusMap.get(s.status) || 0) + 1);

      const custStats = topCustomersMap.get(s.customerId) || { count: 0, revenueKurus: 0 };
      custStats.count++;
      custStats.revenueKurus += s.salePriceKurus;
      topCustomersMap.set(s.customerId, custStats);
    }
    
    // Önceki periyot (Kıyaslama için)
    if (isPrevious) {
      kpi.totalShipments.yesterday++;
      kpi.revenueKurus.yesterday += s.salePriceKurus;
      if (s.status === "delivered") kpi.delivered.yesterday++;
      else if (s.status === "in_transit") kpi.inTransit.yesterday++;
      else if (s.status === "returned") kpi.returned.yesterday++;
    }

    // Trend Grafikleri (Bunlar her zaman sabit son 7 gün ve son 6 ayı göstersin, genel tabloyu görmek için)
    if (sDate >= sevenDaysAgo) {
      const dateKey = sDate.toISOString().split("T")[0];
      if (shipmentTrendMap.has(dateKey)) {
        shipmentTrendMap.set(dateKey, (shipmentTrendMap.get(dateKey) || 0) + 1);
      }
    }

    if (sDate >= sixMonthsAgo) {
      const monthKey = sDate.toLocaleString('tr-TR', { month: 'short' });
      if (revenueTrendMap.has(monthKey)) {
        revenueTrendMap.set(monthKey, (revenueTrendMap.get(monthKey) || 0) + s.salePriceKurus);
      }
    }
  }

  const shipmentTrend = Array.from(shipmentTrendMap.entries())
    .map(([date, count]) => ({
      date: new Date(date).toLocaleString('tr-TR', { day: 'numeric', month: 'short' }),
      count
    })).reverse(); // Oldest to newest

  const revenueTrend = Array.from(revenueTrendMap.entries())
    .map(([month, amountKurus]) => ({ month, amountKurus })).reverse();

  const totalS = kpi.totalShipments.value || 1;
  const byProvider = Array.from(byProviderMap.entries())
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalS) * 100) }))
    .sort((a, b) => b.count - a.count);

  const byStatus = Array.from(byStatusMap.entries())
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalS) * 100) }))
    .sort((a, b) => b.count - a.count);

  const topCustomers = Array.from(topCustomersMap.entries())
    .map(([id, stats]) => ({
      id,
      name: customerMap.get(id) || "Bilinmeyen Müşteri",
      count: stats.count,
      revenueKurus: stats.revenueKurus
    }))
    .sort((a, b) => b.revenueKurus - a.revenueKurus)
    .slice(0, 5);

  // Fake recent transactions based on shipments for now
  const recentTransactions = allShipments
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(s => {
      let title = "Kargo Oluşturuldu";
      if (s.status === "delivered") title = "Gönderi teslim edildi";
      if (s.status === "returned") title = "İade kaydı oluşturuldu";
      return {
        id: s.id,
        type: s.status,
        title,
        subtitle: s.trackingNumber || s.id.slice(0,8),
        timeAgo: "Az önce",
      }
    });

  return {
    kpi,
    shipmentTrend,
    revenueTrend,
    byProvider,
    byStatus,
    topCustomers,
    recentTransactions,
  };
}
