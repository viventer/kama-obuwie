import OrdersStatusWidget from "@/components/adminPanel/dashboard/OrdersStatusWidget";
import { getOrderStatusCounts } from "@/server-actions/stats/dashboard";

export default async function OrdersStatusSection() {
  const orders = await getOrderStatusCounts();
  return <OrdersStatusWidget counts={orders.counts} error={orders.error} />;
}
