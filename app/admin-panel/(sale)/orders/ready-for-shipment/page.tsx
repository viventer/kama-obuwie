import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OrdersDataTable from "@/components/adminPanel/orders/tables/OrdersDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";

export const revalidate = 0;

export default async function OrdersReadyForShipmentPage() {
  const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
    ref
      .where("fulfillment.status", "==", "READY_FOR_SHIPMENT")
      .orderBy("createdAt", "desc")
      .limit(60)
  );

  return (
    <>
      <SubpageHeading text="Zamówienia gotowe do wysyłki" />
      <OrdersDataTable orders={orders || []} phase="ready_for_shipment" />
    </>
  );
}
