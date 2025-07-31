import { Order } from "@/firebase/schemas/ordersSchemas";
import { DeliveryService } from "@/firebase/schemas/shipmentsSchemas";
import { AllegroSalesChannel } from "@/lib/constants";

export default function CreateLabelForm({
  salesChannel,
  allegroOrderId,
  orderDeliveryData,
  deliveryService,
}: {
  salesChannel: AllegroSalesChannel;
  allegroOrderId: string;
  orderDeliveryData: Order["delivery"];
  deliveryService: DeliveryService;
}) {
  return <div>CreateLabelForm</div>;
}
