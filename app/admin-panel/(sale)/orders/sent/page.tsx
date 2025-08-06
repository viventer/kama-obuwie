import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OrdersDataTable from "@/components/adminPanel/orders/tables/OrdersDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";

export const revalidate = 0;

export default async function OrdersSentPage() {
  const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
    ref
      .where("fulfillment.status", "==", "SENT")
      .orderBy("createdAt", "desc")
      .limit(60)
  );

  return (
    <>
      <SubpageHeading text="Zamówienia wysłane" />
      <OrdersDataTable orders={orders || []} phase="sent" />
    </>
  );
}
