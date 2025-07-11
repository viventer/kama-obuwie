import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { getAllegroOrderEvents } from "@/server-actions/allegro/orders";

export const revalidate = 180;

export default async function OrdersNewPage() {
  const orderEvents = await getAllegroOrderEvents();
  console.log("Order Events:", orderEvents);

  return (
    <>
      <SubpageHeading text="Nowe zamówienia" />
    </>
  );
}
