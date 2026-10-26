/**
 * Przelicza salesDaily od zera na podstawie aktualnego stanu zamówień.
 *
 * Uruchamiać przy wstrzymanym zapisie zamówień (sync Allegro, checkout, webhook P24).
 * W trakcie skryptu reconcileOrderSale zmieniłby agregat, który ten skrypt nadpisuje.
 * Cena zakupu jest bieżąca, nie historyczna.
 *
 *   npm run rebuild-sales-daily -- --confirm
 */
import { FieldPath } from "firebase-admin/firestore";
import { adminDB } from "@/firebase/firebaseAdmin";
import { Order } from "@/firebase/schemas/ordersSchemas";
import {
  emptyChannel,
  isCountedFulfillmentStatus,
  isStatsSalesChannel,
  salesDayFromCreatedAt,
  type SalesChannelTotals,
  type StatsSalesChannel,
} from "@/lib/stats/sales";
import { resolveOrderEconomics } from "@/server-actions/stats/salesStats";

const PAGE_SIZE = 200;
const BATCH_SIZE = 400;

type DayTotals = Record<StatsSalesChannel, SalesChannelTotals>;

function emptyDay(): DayTotals {
  return {
    DTC: emptyChannel(),
    AL1: emptyChannel(),
    AL2: emptyChannel(),
  };
}

function addInto(target: SalesChannelTotals, revenue: number, cogs: number, estimated: boolean) {
  target.revenue += revenue;
  target.cogs += cogs;
  target.orders += 1;
  if (estimated) target.cogsEstimatedOrders += 1;
}

function statsMatch(order: Order, next: NonNullable<Order["stats"]>): boolean {
  const current = order.stats;
  if (!current) return false;
  return (
    current.counted === next.counted &&
    current.date === next.date &&
    (current.cogsEstimated ?? false) === (next.cogsEstimated ?? false) &&
    (current.revenue ?? 0) === (next.revenue ?? 0) &&
    (current.cogs ?? 0) === (next.cogs ?? 0)
  );
}

async function commitOps(
  ops: Array<(batch: FirebaseFirestore.WriteBatch) => void>,
) {
  for (let index = 0; index < ops.length; index += BATCH_SIZE) {
    const batch = adminDB.batch();
    for (const op of ops.slice(index, index + BATCH_SIZE)) op(batch);
    await batch.commit();
  }
}

async function main() {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "Operacja nadpisuje salesDaily. Uruchom ponownie z flagą --confirm, gdy zapis zamówień jest wstrzymany.",
    );
    process.exit(1);
  }

  const reads = new Map<string, FirebaseFirestore.DocumentData | null>();
  const read = async (collection: string, id: string) => {
    const key = `${collection}/${id}`;
    const cached = reads.get(key);
    if (cached !== undefined) return cached;
    const doc = await adminDB.collection(collection).doc(id).get();
    const data = doc.exists ? (doc.data() ?? null) : null;
    reads.set(key, data);
    return data;
  };

  const days = new Map<string, DayTotals>();
  const orderOps: Array<(batch: FirebaseFirestore.WriteBatch) => void> = [];
  const invalidCreatedAt: string[] = [];
  let scanned = 0;
  let counted = 0;
  let flagsCleared = 0;

  let last: FirebaseFirestore.QueryDocumentSnapshot | undefined;
  for (;;) {
    let query = adminDB
      .collection("orders")
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);
    if (last) query = query.startAfter(last);

    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      scanned += 1;
      const order = doc.data() as Order;
      const status = order.fulfillment?.status;
      const channel = order.salesChannel;

      if (
        status != null &&
        isCountedFulfillmentStatus(status) &&
        isStatsSalesChannel(channel)
      ) {
        const day = salesDayFromCreatedAt(order.createdAt);
        if (!day) {
          invalidCreatedAt.push(doc.id);
          continue;
        }

        const economics = await resolveOrderEconomics(order, read);
        const bucket = days.get(day) ?? emptyDay();
        addInto(
          bucket[channel],
          economics.revenue,
          economics.cogs,
          economics.cogsEstimated,
        );
        days.set(day, bucket);
        counted += 1;

        const nextStats: NonNullable<Order["stats"]> = {
          counted: true,
          date: day,
          cogsEstimated: economics.cogsEstimated,
          revenue: economics.revenue,
          cogs: economics.cogs,
        };
        if (!statsMatch(order, nextStats)) {
          orderOps.push((batch) => batch.update(doc.ref, { stats: nextStats }));
        }
        continue;
      }

      if (order.stats?.counted === true) {
        flagsCleared += 1;
        orderOps.push((batch) => batch.update(doc.ref, { "stats.counted": false }));
      }
    }

    last = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < PAGE_SIZE) break;
  }

  const existing = await adminDB.collection("salesDaily").get();
  const dailyOps: Array<(batch: FirebaseFirestore.WriteBatch) => void> = [];
  const now = new Date().toISOString();

  for (const [day, totals] of days) {
    dailyOps.push((batch) =>
      batch.set(adminDB.collection("salesDaily").doc(day), {
        date: day,
        updatedAt: now,
        DTC: totals.DTC,
        AL1: totals.AL1,
        AL2: totals.AL2,
      }),
    );
  }

  let deletedDays = 0;
  for (const doc of existing.docs) {
    if (!days.has(doc.id)) {
      deletedDays += 1;
      dailyOps.push((batch) => batch.delete(doc.ref));
    }
  }

  await commitOps(dailyOps);
  await commitOps(orderOps);

  console.log(
    JSON.stringify(
      {
        scanned,
        counted,
        flagsCleared,
        orderUpdates: orderOps.length,
        daysWritten: days.size,
        daysDeleted: deletedDays,
        invalidCreatedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
