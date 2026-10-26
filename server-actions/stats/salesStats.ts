import { FieldValue } from "firebase-admin/firestore";
import { adminDB } from "@/firebase/firebaseAdmin";
import { Offer } from "@/firebase/schemas/offersSchemas";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { Product } from "@/firebase/schemas/productsSchemas";
import {
  isCountedFulfillmentStatus,
  isStatsSalesChannel,
  StatsSalesChannel,
} from "@/lib/stats/sales";

type OrderEconomics = {
  revenue: number;
  cogs: number;
  cogsEstimated: boolean;
};

function lineRevenueGrosze(amount: string, quantity: number): number {
  const unit = Math.round(parseFloat(amount) * 100);
  if (!Number.isFinite(unit)) return 0;
  return unit * quantity;
}

async function resolveOrderEconomics(
  order: Order,
  read: (collection: string, id: string) => Promise<FirebaseFirestore.DocumentData | null>,
): Promise<OrderEconomics> {
  let revenue = 0;
  let cogs = 0;
  let cogsEstimated = false;
  const offers = new Map<string, Offer | null>();
  const purchasePrices = new Map<string, number | null>();

  for (const item of order.lineItems) {
    const lineRevenue = lineRevenueGrosze(item.price.amount, item.quantity);
    revenue += lineRevenue;

    const offerId = item.offer.id;
    let unitCostGrosze: number | null = null;

    if (offerId) {
      let offer = offers.get(offerId);
      if (offer === undefined) {
        const data = await read("offers", offerId);
        offer = (data as Offer | null) ?? null;
        offers.set(offerId, offer);
      }

      const productId = offer?.productId;
      if (productId) {
        let purchasePrice = purchasePrices.get(productId);
        if (purchasePrice === undefined) {
          const data = await read("products", productId);
          purchasePrice = (data as Product | null)?.purchasePrice ?? null;
          purchasePrices.set(productId, purchasePrice);
        }

        if (purchasePrice && purchasePrice > 0) {
          unitCostGrosze = Math.round(purchasePrice * 100);
        }
      }
    }

    if (unitCostGrosze == null) {
      cogs += Math.round(lineRevenue * 0.5);
      cogsEstimated = true;
    } else {
      cogs += unitCostGrosze * item.quantity;
    }
  }

  return { revenue, cogs, cogsEstimated };
}

function applyDailyDelta(
  transaction: FirebaseFirestore.Transaction,
  day: string,
  channel: StatsSalesChannel,
  revenue: number,
  cogs: number,
  orders: number,
  cogsEstimatedOrders: number,
) {
  transaction.set(
    adminDB.collection("salesDaily").doc(day),
    {
      date: day,
      updatedAt: new Date().toISOString(),
      [channel]: {
        revenue: FieldValue.increment(revenue),
        cogs: FieldValue.increment(cogs),
        orders: FieldValue.increment(orders),
        cogsEstimatedOrders: FieldValue.increment(cogsEstimatedOrders),
      },
    },
    { merge: true },
  );
}

/**
 * Dopasowuje salesDaily do aktualnego statusu zamówienia.
 * Decyzja jest podejmowana wewnątrz transakcji, żeby równoległe
 * utworzenie i anulowanie nie policzyły sprzedaży dwa razy
 * albo nie pominęły cofnięcia.
 */
export async function reconcileOrderSale(orderId: string) {
  const orderRef = adminDB.collection("orders").doc(orderId);

  await adminDB.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(orderRef);
    const current = snapshot.data() as Order | undefined;
    if (!current?.fulfillment?.status) return;
    if (!isStatsSalesChannel(current.salesChannel)) return;

    const status = current.fulfillment.status;
    const counted = current.stats?.counted === true;
    const channel = current.salesChannel;

    if (!counted && isCountedFulfillmentStatus(status)) {
      if (!current.createdAt || current.createdAt.length < 10) return;
      const day = current.createdAt.slice(0, 10);
      const economics = await resolveOrderEconomics(current, async (collection, id) => {
        const doc = await transaction.get(adminDB.collection(collection).doc(id));
        return doc.exists ? (doc.data() ?? null) : null;
      });

      applyDailyDelta(
        transaction,
        day,
        channel,
        economics.revenue,
        economics.cogs,
        1,
        economics.cogsEstimated ? 1 : 0,
      );
      transaction.update(orderRef, {
        stats: {
          counted: true,
          date: day,
          cogsEstimated: economics.cogsEstimated,
          revenue: economics.revenue,
          cogs: economics.cogs,
        },
      });
      return;
    }

    if (
      counted &&
      current.stats?.date &&
      (status === "CANCELLED" || status === "RETURNED")
    ) {
      applyDailyDelta(
        transaction,
        current.stats.date,
        channel,
        -(current.stats.revenue ?? 0),
        -(current.stats.cogs ?? 0),
        -1,
        current.stats.cogsEstimated ? -1 : 0,
      );
      transaction.update(orderRef, {
        "stats.counted": false,
      });
    }
  });
}
