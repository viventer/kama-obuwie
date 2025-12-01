import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import CreateAllegroLabelForm from "@/components/adminPanel/orders/allegro/CreateAllegroLabelForm";
import OrderDataWidget from "@/components/adminPanel/orders/OrderDataWidget";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { AllegroSalesChannel } from "@/lib/constants";
import { getAllegroDeliveryServices } from "@/server-actions/allegro/shipmentManagement";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Utwórz etykietę`,
  };
}

export default async function CreateLabelPage(props: Props) {
  const { orderId } = await props.params;
  const { data } = await getDocumentFromAdminDB<OrderWithId>("orders", orderId);

  if (!data || !data?.delivery || !data.allegroId) {
    return notFound();
  }

  const deliveryServices = await getAllegroDeliveryServices();
  if (!deliveryServices || !deliveryServices.AL1 || !deliveryServices.AL2) {
    return notFound();
  }

  const selectedService = deliveryServices[
    data.salesChannel as AllegroSalesChannel
  ].find(
    (service: any) =>
      service.id.deliveryMethodId === data!.delivery!.allegroMethod!.id
  );

  if (!selectedService) {
    return notFound();
  }

  return (
    <FormWrapper headingText="Utwórz etykietę">
      <OrderDataWidget data={data as OrderWithId} />
      <CreateAllegroLabelForm
        orderData={data as OrderWithId}
        deliveryService={selectedService}
      />
    </FormWrapper>
  );
}
