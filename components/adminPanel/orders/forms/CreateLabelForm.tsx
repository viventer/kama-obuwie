import { Order } from "@/firebase/schemas/ordersSchemas";
import { AllegroSalesChannel } from "@/lib/constants";

export default function CreateLabelForm({
  salesChannel,
  allegroOrderId,
  orderDeliveryData,
}: {
  salesChannel: AllegroSalesChannel;
  allegroOrderId: string;
  orderDeliveryData: Order["delivery"];
}) {
  return <div>CreateLabelForm</div>;
}
