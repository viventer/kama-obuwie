"use server";

import { FieldPath } from "firebase-admin/firestore";
import { z } from "zod";
import { adminDB } from "@/firebase/firebaseAdmin";
import { addCalendarDays, getPolandDateString } from "@/helpers/datetime";
import { verifyUser } from "@/server-actions/auth/auth";
import { getAllegroReturns } from "@/server-actions/allegro/returns";
import {
  emptyChannel,
  emptyReturnBuckets,
  countReturnBuckets,
  ORDER_STATUS_WIDGETS,
  PRODUCT_STAGE_WIDGETS,
  type OrderStatusCount,
  type ProductStageCount,
  type ReturnBucketCount,
  type SalesChannelTotals,
  type SalesDailyPoint,
} from "@/lib/stats/sales";

const salesWindowSchema = z.union([z.literal(7), z.literal(30)]);

export type SalesDailyResult = {
  today: string;
  points: SalesDailyPoint[];
};

export type OrderStatusCountsResult = {
  counts: OrderStatusCount[];
  error: string | null;
};

export type ReturnsStatusCountsResult = {
  buckets: ReturnBucketCount[];
  error: string | null;
};

function normalizeChannel(value: unknown): SalesChannelTotals {
  const channel = (value ?? {}) as Partial<SalesChannelTotals>;
  return {
    revenue: channel.revenue ?? 0,
    cogs: channel.cogs ?? 0,
    orders: channel.orders ?? 0,
    cogsEstimatedOrders: channel.cogsEstimatedOrders ?? 0,
  };
}

function firestoreErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Nie udało się pobrać danych.";
}

export async function getSalesDaily(days: 7 | 30 = 30): Promise<SalesDailyResult> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const windowDays = salesWindowSchema.parse(days);
  const today = getPolandDateString();
  const from = addCalendarDays(today, -windowDays);

  const snapshot = await adminDB
    .collection("salesDaily")
    .where(FieldPath.documentId(), ">=", from)
    .where(FieldPath.documentId(), "<=", today)
    .get();

  const byDate = new Map<string, SalesDailyPoint>();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    byDate.set(doc.id, {
      date: doc.id,
      DTC: normalizeChannel(data.DTC),
      AL1: normalizeChannel(data.AL1),
      AL2: normalizeChannel(data.AL2),
    });
  }

  const points: SalesDailyPoint[] = [];
  for (let offset = windowDays; offset >= 0; offset -= 1) {
    const date = addCalendarDays(today, -offset);
    points.push(
      byDate.get(date) ?? {
        date,
        DTC: emptyChannel(),
        AL1: emptyChannel(),
        AL2: emptyChannel(),
      },
    );
  }

  return { today, points };
}

async function countOrders(
  status: string,
  channel: "dtc" | "allegro",
): Promise<number> {
  let query: FirebaseFirestore.Query = adminDB
    .collection("orders")
    .where("fulfillment.status", "==", status);

  query =
    channel === "dtc"
      ? query.where("salesChannel", "==", "DTC")
      : query.where("salesChannel", "in", ["AL1", "AL2"]);

  const snapshot = await query.count().get();
  return snapshot.data().count;
}

export async function getOrderStatusCounts(): Promise<OrderStatusCountsResult> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [openCounts, recentSnapshot] = await Promise.all([
      Promise.all(
        ORDER_STATUS_WIDGETS.filter((widget) => !widget.windowHours).map(
          async (widget) => {
            const [dtc, allegro] = await Promise.all([
              countOrders(widget.status, "dtc"),
              countOrders(widget.status, "allegro"),
            ]);
            return {
              status: widget.status,
              label: widget.label,
              dtc,
              allegro,
            };
          },
        ),
      ),
      // Samo statusChangedAt ma indeks jednopolowy. Złożony indeks
      // status + kanał + data nie jest potrzebny — okno 24h jest małe.
      adminDB
        .collection("orders")
        .where("statusChangedAt", ">=", cutoff)
        .select("fulfillment.status", "salesChannel")
        .get(),
    ]);

    const recent: Record<"SENT" | "CANCELLED", { dtc: number; allegro: number }> =
      {
        SENT: { dtc: 0, allegro: 0 },
        CANCELLED: { dtc: 0, allegro: 0 },
      };

    for (const doc of recentSnapshot.docs) {
      const data = doc.data();
      const status = data.fulfillment?.status as string | undefined;
      const channel = data.salesChannel as string | undefined;
      if (status !== "SENT" && status !== "CANCELLED") continue;

      if (channel === "DTC") recent[status].dtc += 1;
      else if (channel === "AL1" || channel === "AL2") recent[status].allegro += 1;
    }

    const counts = ORDER_STATUS_WIDGETS.map((widget) => {
      if (widget.status === "SENT" || widget.status === "CANCELLED") {
        return {
          status: widget.status,
          label: widget.label,
          dtc: recent[widget.status].dtc,
          allegro: recent[widget.status].allegro,
        };
      }

      const open = openCounts.find((count) => count.status === widget.status);
      return {
        status: widget.status,
        label: widget.label,
        dtc: open?.dtc ?? 0,
        allegro: open?.allegro ?? 0,
      };
    });

    return { counts, error: null };
  } catch (error) {
    console.error("[dashboard] getOrderStatusCounts", error);
    return {
      counts: ORDER_STATUS_WIDGETS.map((widget) => ({
        status: widget.status,
        label: widget.label,
        dtc: 0,
        allegro: 0,
      })),
      error: firestoreErrorMessage(error),
    };
  }
}

export async function getProductStageCounts(): Promise<ProductStageCount[]> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  return Promise.all(
    PRODUCT_STAGE_WIDGETS.map(async (widget) => {
      const snapshot = await adminDB
        .collection("products")
        .where("creationStage", "==", widget.stage)
        .count()
        .get();

      return {
        stage: widget.stage,
        label: widget.label,
        count: snapshot.data().count,
      };
    }),
  );
}

export async function getReturnsStatusCounts(): Promise<ReturnsStatusCountsResult> {
  await verifyUser(["ADMIN", "VERIFIED"]);

  try {
    const response = await getAllegroReturns();
    if (!response) {
      return {
        buckets: emptyReturnBuckets(),
        error: "Nie udało się pobrać zwrotów z Allegro.",
      };
    }

    return {
      buckets: countReturnBuckets([
        ...response.AL1.map((item) => item.status),
        ...response.AL2.map((item) => item.status),
      ]),
      error: null,
    };
  } catch (error) {
    console.error("[dashboard] getReturnsStatusCounts", error);
    return {
      buckets: emptyReturnBuckets(),
      error: firestoreErrorMessage(error),
    };
  }
}
