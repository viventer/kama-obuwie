import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import OrdersDataTable from "@/components/adminPanel/orders/tables/OrdersDataTable";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { syncAllegroOrders } from "@/server-actions/allegro/orders";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function OrdersNewPage() {
  try {
    await syncAllegroOrders();
  } catch (err) {
    console.error("Błąd podczas synchronizacji zamówień z Allegro:", err);
    redirect("/admin-auth/allegro-connect");
  }
  const orders = await getDocumentsFromAdminDB<Order>("orders", (ref) =>
    ref
      .where("fulfillment.status", "==", "NEW")
      .orderBy("createdAt", "desc")
      .limit(60)
  );

  return (
    <>
      <SubpageHeading text="Nowe zamówienia" />
      <OrdersDataTable orders={orders || []} phase="new" />
    </>
  );
}
