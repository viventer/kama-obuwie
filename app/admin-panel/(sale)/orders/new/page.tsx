import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OrdersDataTable from "@/components/adminPanel/orders/OrdersDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { syncAllegroOrders } from "@/server-actions/allegro/orders";

export const revalidate = 180;

export default async function OrdersNewPage() {
  await syncAllegroOrders();
  const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
    ref
      .where("fulfillment.status", "==", "NEW")
      .orderBy("createdAt", "desc")
      .limit(60)
  );

  return (
    <>
      <SubpageHeading text="Nowe zamówienia" />
      <OrdersDataTable orders={orders || []} />
    </>
  );
}
