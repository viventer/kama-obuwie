import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OrdersDataTable from "@/components/adminPanel/orders/tables/OrdersDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";

export const revalidate = 0;

export default async function OrdersCancelledPage() {
  const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
    ref
      .where("fulfillment.status", "==", "CANCELLED")
      .orderBy("createdAt", "desc")
      .limit(60)
  );

  return (
    <>
      <SubpageHeading text="Zamówienia anulowane" />
      <OrdersDataTable orders={orders || []} phase="cancelled" />
    </>
  );
}
