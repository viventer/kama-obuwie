import { addCalendarDays, getPolandDateString } from "@/helpers/datetime";
import { FulfillmentStatus } from "@/firebase/schemas/ordersSchemas";
import { ReturnStatus } from "@/firebase/schemas/returnsSchemas";

export const COUNTED_FULFILLMENT_STATUSES = [
  "NEW",
  "PROCESSING",
  "READY_FOR_SHIPMENT",
  "READY_FOR_PICKUP",
  "SENT",
  "PICKED_UP",
] as const satisfies readonly FulfillmentStatus[];

// SUSPENDED nie jest sprzedażą. Zawieszenie cofa policzone zamówienie,
// a powrót do statusu liczonego dolicza je ponownie.
export const REVERSED_FULFILLMENT_STATUSES = [
  "CANCELLED",
  "RETURNED",
  "SUSPENDED",
] as const satisfies readonly FulfillmentStatus[];

export type StatsSalesChannel = "DTC" | "AL1" | "AL2";

export function isStatsSalesChannel(
  channel: string,
): channel is StatsSalesChannel {
  return channel === "DTC" || channel === "AL1" || channel === "AL2";
}

export function isCountedFulfillmentStatus(
  status: string,
): status is (typeof COUNTED_FULFILLMENT_STATUSES)[number] {
  return (COUNTED_FULFILLMENT_STATUSES as readonly string[]).includes(status);
}

export function isReversedFulfillmentStatus(
  status: string,
): status is (typeof REVERSED_FULFILLMENT_STATUSES)[number] {
  return (REVERSED_FULFILLMENT_STATUSES as readonly string[]).includes(status);
}

/** Dzień sprzedaży w Europe/Warsaw. Akceptuje ISO z offsetem PL i UTC z Z. */
export function salesDayFromCreatedAt(createdAt: string): string | null {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  return getPolandDateString(created);
}

export type SalesChannelTotals = {
  revenue: number;
  cogs: number;
  orders: number;
  cogsEstimatedOrders: number;
};

export type SalesDailyPoint = {
  date: string;
  DTC: SalesChannelTotals;
  AL1: SalesChannelTotals;
  AL2: SalesChannelTotals;
};

export const EMPTY_CHANNEL: SalesChannelTotals = {
  revenue: 0,
  cogs: 0,
  orders: 0,
  cogsEstimatedOrders: 0,
};

export function emptyChannel(): SalesChannelTotals {
  return { ...EMPTY_CHANNEL };
}

export function addChannels(
  a: SalesChannelTotals,
  b: SalesChannelTotals,
): SalesChannelTotals {
  return {
    revenue: a.revenue + b.revenue,
    cogs: a.cogs + b.cogs,
    orders: a.orders + b.orders,
    cogsEstimatedOrders: a.cogsEstimatedOrders + b.cogsEstimatedOrders,
  };
}

export type SalesPeriod = "today" | "yesterday" | "7d" | "30d";

export function filterSalesPeriod(
  points: SalesDailyPoint[],
  period: SalesPeriod,
  today: string,
): SalesDailyPoint[] {
  if (period === "today") {
    return points.filter((point) => point.date === today);
  }
  if (period === "yesterday") {
    const yesterday = addCalendarDays(today, -1);
    return points.filter((point) => point.date === yesterday);
  }

  const days = period === "7d" ? 7 : 30;
  const from = addCalendarDays(today, -days);
  return points.filter((point) => point.date >= from && point.date < today);
}

export type SalesChartPoint = {
  date: string;
  label: string;
  dtc: number;
  allegro: number;
  total: number;
};

/** Seria dzienna bez dzisiejszego dnia. Kwoty w złotych. */
export function buildSalesChartSeries(
  points: SalesDailyPoint[],
  days: 7 | 30,
  today: string,
): SalesChartPoint[] {
  const byDate = new Map(points.map((point) => [point.date, point]));
  const series: SalesChartPoint[] = [];

  for (let offset = days; offset >= 1; offset -= 1) {
    const date = addCalendarDays(today, -offset);
    const point = byDate.get(date);
    const dtc = (point?.DTC.revenue ?? 0) / 100;
    const allegro =
      ((point?.AL1.revenue ?? 0) + (point?.AL2.revenue ?? 0)) / 100;
    const [, month, day] = date.split("-");
    series.push({
      date,
      label: `${day}.${month}`,
      dtc,
      allegro,
      total: dtc + allegro,
    });
  }

  return series;
}

export function formatGrosze(grosze: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(grosze / 100);
}

export function formatPln(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(amount);
}

export function formatPlnAxis(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatMargin(revenue: number, cogs: number): string {
  if (revenue <= 0) return "—";
  const margin = revenue - cogs;
  const percent = Math.round((margin / revenue) * 100);
  return `${percent}% (${formatGrosze(margin)})`;
}

export function formatAov(revenue: number, orders: number): string {
  if (orders <= 0) return "—";
  return formatGrosze(Math.round(revenue / orders));
}

export const ORDER_STATUS_WIDGETS = [
  { status: "NEW", label: "Nowe", windowHours: null },
  { status: "PROCESSING", label: "W realizacji", windowHours: null },
  { status: "READY_FOR_SHIPMENT", label: "Do wysyłki", windowHours: null },
  { status: "SENT", label: "Wysłane", windowHours: 24 },
  { status: "CANCELLED", label: "Anulowane", windowHours: 24 },
] as const;

export type OrderStatusWidgetKey =
  (typeof ORDER_STATUS_WIDGETS)[number]["status"];

export type OrderStatusCount = {
  status: OrderStatusWidgetKey;
  label: string;
  dtc: number;
  allegro: number;
};

export const PRODUCT_STAGE_WIDGETS = [
  { stage: "new", label: "Nowe" },
  { stage: "photos", label: "Zdjęcia" },
  { stage: "photosEdit", label: "Edycja" },
  { stage: "parameters", label: "Dane" },
  { stage: "description", label: "Opis" },
  { stage: "postOffer", label: "Wystawianie" },
] as const;

export type ProductStageCount = {
  stage: (typeof PRODUCT_STAGE_WIDGETS)[number]["stage"];
  label: string;
  count: number;
};

const RETURN_BUCKETS = [
  { key: "created", label: "Zgłoszone", statuses: ["CREATED"] },
  { key: "dispatched", label: "Nadane", statuses: ["DISPATCHED"] },
  { key: "inTransit", label: "W drodze", statuses: ["IN_TRANSIT"] },
  {
    key: "delivered",
    label: "Doręczone",
    statuses: ["DELIVERED", "WAREHOUSE_DELIVERED", "WAREHOUSE_VERIFICATION"],
  },
  {
    key: "finished",
    label: "Zrealizowane",
    statuses: [
      "FINISHED",
      "FINISHED_APT",
      "COMMISSION_REFUND_CLAIMED",
      "COMMISSION_REFUNDED",
    ],
  },
  { key: "rejected", label: "Anulowane", statuses: ["REJECTED"] },
] as const satisfies readonly {
  key: string;
  label: string;
  statuses: readonly ReturnStatus[];
}[];

export type ReturnBucketCount = {
  key: (typeof RETURN_BUCKETS)[number]["key"];
  label: string;
  count: number;
};

export function emptyReturnBuckets(): ReturnBucketCount[] {
  return RETURN_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    count: 0,
  }));
}

export function countReturnBuckets(
  statuses: ReturnStatus[],
): ReturnBucketCount[] {
  const buckets = emptyReturnBuckets();
  const indexByStatus = new Map<ReturnStatus, number>();

  RETURN_BUCKETS.forEach((bucket, index) => {
    for (const status of bucket.statuses) {
      indexByStatus.set(status, index);
    }
  });

  for (const status of statuses) {
    const index = indexByStatus.get(status);
    if (index !== undefined) {
      buckets[index].count += 1;
    }
  }

  return buckets;
}
